"""
FastAPI backend for the BreedVision breed-recognition frontend.

Performance notes
-----------------
- Grad-CAM and the Supabase insert are run in a thread pool so they
  never block FastAPI's async event loop.
- Grok fallback only fires when local confidence is genuinely low
  (threshold raised to 35 by default — tunable via CONFIDENCE_FALLBACK_THRESHOLD).
- The Supabase insert is fire-and-forget (background task) so the
  JSON response is returned to the browser the moment inference is done.

Run from inside the backend/ folder:
    uvicorn main:app --reload --port 8000
"""

import asyncio
import base64
import io
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from supabase import Client
from torchvision import models, transforms

from auth import get_optional_user
from breed_metadata import get_animal_type, get_breed_status
from config import CONFIDENCE_FALLBACK_THRESHOLD
from database import get_supabase
from cattle_gate import is_cattle_or_buffalo
from grok_fallback import predict_with_grok

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "resnet18_breed_model.pth")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Thread pool for CPU-bound work (Grad-CAM, image transforms)
_executor = ThreadPoolExecutor(max_workers=2)

# ── Load model once at startup ────────────────────────────────────────────────
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model file not found at {MODEL_PATH}. "
        "Make sure resnet18_breed_model.pth sits next to main.py."
    )

checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=True)
class_to_idx = checkpoint["class_to_idx"]
idx_to_class = {idx: name for name, idx in class_to_idx.items()}

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, len(class_to_idx))
model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# ── Grad-CAM helpers ──────────────────────────────────────────────────────────

def _apply_jet_colormap(gray: np.ndarray) -> np.ndarray:
    r = np.clip(1.5 - np.abs(4.0 * gray - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(4.0 * gray - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(4.0 * gray - 1.0), 0.0, 1.0)
    alpha = np.ones_like(r)
    rgba = np.stack([r, g, b, alpha], axis=-1)
    return (rgba * 255).astype(np.uint8)


def _compute_gradcam_sync(
    original_image: Image.Image,
    input_tensor: torch.Tensor,
    target_class_idx: int,
) -> tuple[str, str]:
    """CPU-bound Grad-CAM — runs in the thread pool, NOT on the event loop."""
    activations: list[torch.Tensor] = []
    gradients: list[torch.Tensor] = []

    def forward_hook(_, __, output):
        activations.append(output)

    def backward_hook(_, __, grad_output):
        gradients.append(grad_output[0])

    fwd_handle = model.layer4.register_forward_hook(forward_hook)
    bwd_handle = model.layer4.register_full_backward_hook(backward_hook)

    try:
        outputs = model(input_tensor)
        model.zero_grad()
        score = outputs[0, target_class_idx]
        score.backward()
    finally:
        fwd_handle.remove()
        bwd_handle.remove()

    act  = activations[0].detach().cpu()
    grad = gradients[0].detach().cpu()

    weights = grad.mean(dim=(2, 3), keepdim=True)
    cam = (weights * act).sum(dim=1, keepdim=True)
    cam = torch.relu(cam)
    cam = torch.nn.functional.interpolate(
        cam, size=(224, 224), mode="bilinear", align_corners=False
    )
    cam = cam.squeeze().numpy()

    cam_min, cam_max = cam.min(), cam.max()
    cam = (cam - cam_min) / (cam_max - cam_min) if cam_max > cam_min else np.zeros_like(cam)

    heatmap_rgba = _apply_jet_colormap(cam)
    heatmap_pil  = Image.fromarray(heatmap_rgba, mode="RGBA")

    heatmap_buf = io.BytesIO()
    heatmap_pil.save(heatmap_buf, format="PNG")
    heatmap_b64 = base64.b64encode(heatmap_buf.getvalue()).decode("utf-8")

    orig_resized = original_image.resize((224, 224)).convert("RGBA")
    alpha_channel = (cam * 200).astype(np.uint8)
    heatmap_rgba[:, :, 3] = alpha_channel
    overlay_pil = Image.alpha_composite(orig_resized, Image.fromarray(heatmap_rgba, mode="RGBA"))

    overlay_buf = io.BytesIO()
    overlay_pil.save(overlay_buf, format="PNG")
    overlay_b64 = base64.b64encode(overlay_buf.getvalue()).decode("utf-8")

    return heatmap_b64, overlay_b64


async def compute_gradcam(image, input_tensor, target_class_idx):
    """Runs Grad-CAM in a thread pool so it doesn't block the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        _executor, _compute_gradcam_sync, image, input_tensor, target_class_idx
    )


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="BreedVision API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "num_classes": len(class_to_idx), "device": str(device)}


# ── Predict ───────────────────────────────────────────────────────────────────
@app.post("/predict")
async def predict(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_optional_user),
    sb: Client = Depends(get_supabase),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the uploaded image.")

    # ── 0. Reject images that are not a cow or buffalo ───────────────────────
    loop = asyncio.get_event_loop()
    is_valid = await loop.run_in_executor(_executor, is_cattle_or_buffalo, image)
    if not is_valid:
        raise HTTPException(
            status_code=422,
            detail="This doesn't look like a cow or buffalo. Please upload a clear photo of the animal.",
        )

    # ── 1. Local model inference (fast, ~50–200 ms on CPU) ───────────────────
    input_tensor = transform(image).unsqueeze(0).to(device)

    t0 = asyncio.get_event_loop().time()
    with torch.no_grad():
        outputs       = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
    print(f"[Predict] Inference done in {(asyncio.get_event_loop().time()-t0)*1000:.0f}ms")

    top3_probs, top3_idx = torch.topk(probabilities, k=min(3, len(class_to_idx)))
    top3_predictions = [
        {"breed": idx_to_class[idx.item()], "confidence": round(prob.item() * 100, 2)}
        for prob, idx in zip(top3_probs, top3_idx)
    ]

    predicted_breed = top3_predictions[0]["breed"]
    confidence      = top3_predictions[0]["confidence"]

    # ── 2. Grok fallback — only when local model is genuinely unsure ─────────
    source = "local_model"
    local_model_breed = None
    local_model_confidence = None

    print(f"[Predict] Local model → {predicted_breed} ({confidence:.1f}%)")

    if confidence < CONFIDENCE_FALLBACK_THRESHOLD:
        print(f"[Predict] ⚠️  Confidence {confidence:.1f}% < threshold {CONFIDENCE_FALLBACK_THRESHOLD}% — calling Grok")
        grok_result = await predict_with_grok(contents, list(class_to_idx.keys()))
        if grok_result is not None:
            local_model_breed      = predicted_breed
            local_model_confidence = confidence
            predicted_breed        = grok_result["predictedBreed"]
            confidence             = grok_result["confidence"]
            top3_predictions       = grok_result["top3Predictions"]
            source                 = "grok_fallback"
    else:
        print(f"[Predict] ✅ Local model confident enough — Grok not called")

    animal_type      = get_animal_type(predicted_breed)
    breed_status     = get_breed_status(confidence)
    target_class_idx = class_to_idx[predicted_breed]

    # ── 5. Insert to Supabase synchronously so we can return the id ─────────
    user_id   = current_user["id"]   if current_user else None
    user_name = current_user["name"] if current_user else None

    record = {
        "user_id":                user_id,
        "user_name":              user_name,
        "image_filename":         file.filename,
        "predicted_breed":        predicted_breed,
        "confidence":             round(confidence),
        "top3_predictions":       top3_predictions,
        "animal_type":            animal_type,
        "breed_status":           breed_status,
        "source":                 source,
        "local_model_breed":      local_model_breed,
        "local_model_confidence": (
            round(local_model_confidence) if local_model_confidence is not None else None
        ),
        "status":           "Pending",
        "grad_cam_heatmap": None,
        "grad_cam_overlay": None,
    }

    row_id = None
    try:
        result = sb.table("analyses").insert(record).execute()
        row_id = result.data[0]["id"] if result.data else None
        print(f"[Predict] ✅ DB insert done, row id={row_id}")
    except Exception as exc:
        print(f"[Predict] ⚠️  Supabase insert failed: {exc}")

    # ── 6. Compute Grad-CAM in background and update the row ─────────────────
    def _gradcam_task():
        try:
            import asyncio as _asyncio
            loop = _asyncio.new_event_loop()
            heatmap_b64, overlay_b64 = loop.run_until_complete(
                compute_gradcam(image, transform(image).unsqueeze(0).to(device), target_class_idx)
            )
            loop.close()
            h_uri = f"data:image/png;base64,{heatmap_b64}" if heatmap_b64 else None
            o_uri = f"data:image/png;base64,{overlay_b64}" if overlay_b64 else None
            if row_id and (h_uri or o_uri):
                sb.table("analyses").update({
                    "grad_cam_heatmap": h_uri,
                    "grad_cam_overlay": o_uri,
                }).eq("id", row_id).execute()
                print(f"[Predict] ✅ Grad-CAM saved to row {row_id}")
        except Exception as exc:
            print(f"[Predict] ⚠️  Grad-CAM background task failed: {exc}")

    background_tasks.add_task(_gradcam_task)

    return {
        "id":                    row_id,
        "animalType":            animal_type,
        "predictedBreed":        predicted_breed,
        "confidence":            round(confidence),
        "top3Predictions":       top3_predictions,
        "breedStatus":           breed_status,
        "source":                source,
        "localModelBreed":       local_model_breed,
        "localModelConfidence": (
            round(local_model_confidence) if local_model_confidence is not None else None
        ),
        "gradCamHeatmap": None,
        "gradCamOverlay": None,
    }
