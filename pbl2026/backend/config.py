import os

from dotenv import load_dotenv

load_dotenv(override=True)  # override=True forces .env values over any existing OS env vars

XAI_API_KEY = os.getenv("XAI_API_KEY", "")
GROK_MODEL  = os.getenv("GROK_MODEL", "grok-2-vision-1212")

# Set to 0 in .env to disable Grok entirely (local model only, fast).
# Set to 35+ to enable Grok when local confidence is low (slower, more accurate).
CONFIDENCE_FALLBACK_THRESHOLD = float(os.getenv("CONFIDENCE_FALLBACK_THRESHOLD", "0"))

print(f"[Config] CONFIDENCE_FALLBACK_THRESHOLD = {CONFIDENCE_FALLBACK_THRESHOLD}")
print(f"[Config] XAI_API_KEY set = {bool(XAI_API_KEY)}")
print(f"[Config] GROK_MODEL = {GROK_MODEL}")
