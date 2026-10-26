"""
Gate that checks whether an uploaded image really shows a cow or buffalo
BEFORE the breed model runs. The breed model only knows 41 breeds, so without
this check it would name a breed even for a dog, a person or a car.

Uses CLIP zero-shot classification (no training needed).
"""

import torch
from transformers import CLIPModel, CLIPProcessor

clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").eval()
clip_proc = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

LABELS = [
    "a photo of a cow", "a photo of a buffalo", "a photo of a dog",
    "a photo of a person", "a photo of a goat or sheep", "a photo of a horse",
    "a photo of a vehicle", "a photo of a building or landscape",
    "a photo of something else",
]

# Minimum combined probability of "cow" + "buffalo" needed to accept the image.
# Lower it (e.g. 0.35) if real animals get rejected; raise it (e.g. 0.6) if
# non-cattle images still get through.
CATTLE_THRESHOLD = 0.5


def is_cattle_or_buffalo(image) -> bool:
    inputs = clip_proc(text=LABELS, images=image, return_tensors="pt", padding=True)
    with torch.no_grad():
        probs = clip(**inputs).logits_per_image.softmax(dim=1)[0]
    score = (probs[0] + probs[1]).item()
    print(f"[Gate] cow+buffalo probability = {score:.2f} (threshold {CATTLE_THRESHOLD})")
    return score >= CATTLE_THRESHOLD
