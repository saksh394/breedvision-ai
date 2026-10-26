
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os

# Find the backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "resnet18_breed_model.pth")

# Select device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load saved model and class names
checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=True
)

class_to_idx = checkpoint["class_to_idx"]
idx_to_class = {idx: name for name, idx in class_to_idx.items()}

# Recreate ResNet18 architecture
model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, len(class_to_idx))

model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Predict breed
def predict_breed(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, dim=1)

    breed = idx_to_class[predicted.item()]
    confidence = confidence.item() * 100

    return {
        "breed": breed,
        "confidence": round(confidence, 2)
    }

print("Model loaded successfully!")