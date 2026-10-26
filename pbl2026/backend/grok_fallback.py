"""
Fallback classifier using xAI's Grok vision model, used only when the local
ResNet18 model's confidence is below CONFIDENCE_FALLBACK_THRESHOLD.

Returns None (never raises) if the call fails, the key is missing, or Grok's
answer can't be trusted — the caller should fall back to the original local
prediction in that case rather than crash the request.
"""

import base64
import json

import httpx

from config import GROK_MODEL, XAI_API_KEY

XAI_ENDPOINT = "https://api.x.ai/v1/chat/completions"


async def predict_with_grok(image_bytes: bytes, breed_classes: list[str]) -> dict | None:
    if not XAI_API_KEY:
        print("[Grok] ❌ XAI_API_KEY is not set — skipping Grok fallback")
        return None

    print(f"[Grok] 🔑 Key found (starts with: {XAI_API_KEY[:8]}...)")
    print(f"[Grok] 📤 Calling xAI API with model: {GROK_MODEL}")

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    breed_list_str = ", ".join(breed_classes)

    prompt = (
        "You are an expert in Indian cattle and buffalo breed identification. "
        "Look at this image and identify the breed, choosing ONLY from this "
        f"exact list of breeds, using the exact spelling given: {breed_list_str}. "
        "Respond with ONLY valid JSON, no other text, in this exact format: "
        '{"predictedBreed": "<breed from the list>", "confidence": <integer 0-100>, '
        '"top3Predictions": [{"breed": "<breed>", "confidence": <0-100>}, '
        '{"breed": "<breed>", "confidence": <0-100>}, '
        '{"breed": "<breed>", "confidence": <0-100>}]}'
    )

    payload = {
        "model": GROK_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"},
                    },
                ],
            }
        ],
        "temperature": 0,
    }

    headers = {"Authorization": f"Bearer {XAI_API_KEY}", "Content-Type": "application/json"}

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(XAI_ENDPOINT, json=payload, headers=headers)
            print(f"[Grok] 📥 Response status: {response.status_code}")
            if response.status_code != 200:
                print(f"[Grok] ❌ Error body: {response.text[:500]}")
                return None
            data = response.json()
            text = data["choices"][0]["message"]["content"].strip()
            print(f"[Grok] 💬 Raw response: {text[:200]}")  # first 200 chars

            # Grok sometimes wraps JSON in markdown code fences — strip defensively
            if text.startswith("```"):
                text = text.strip("`")
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()

            parsed = json.loads(text)

            if parsed.get("predictedBreed") not in breed_classes:
                print(f"[Grok] ⚠️ Breed '{parsed.get('predictedBreed')}' not in known list — ignoring")
                return None

            print(f"[Grok] ✅ Result: {parsed['predictedBreed']} ({parsed['confidence']}%)")
            return parsed
    except Exception as exc:
        print(f"[Grok] ❌ Call failed: {type(exc).__name__}: {exc}")
        return None
