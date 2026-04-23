import io
import os
import time
from pathlib import Path

import timm
import torch
from flask import Flask, jsonify, request
from PIL import Image
from torchvision import transforms


ROOT = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", ROOT / "baseline_ffpp_94.pth"))
HOST = os.getenv("MODEL_HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", os.getenv("MODEL_PORT", "10000")))
THRESHOLD = float(os.getenv("MODEL_THRESHOLD", "0.5"))
POSITIVE_CLASS = os.getenv("MODEL_POSITIVE_CLASS", "fake").strip().lower()

device = torch.device("cpu")

transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


def build_model():
    model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=1)
    state_dict = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model


model = build_model()
app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "modelPath": str(MODEL_PATH),
            "threshold": THRESHOLD,
            "positiveClass": POSITIVE_CLASS,
        }
    )


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return ("", 204)

    uploaded = request.files.get("image")
    if uploaded is None:
        return jsonify({"error": "No image file was provided under field name 'image'."}), 400

    image_bytes = uploaded.read()
    if not image_bytes:
        return jsonify({"error": "The uploaded image file is empty."}), 400

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        return jsonify({"error": f"Could not read image: {exc}"}), 400

    tensor = transform(image).unsqueeze(0).to(device)

    start = time.perf_counter()
    with torch.no_grad():
        logit = model(tensor).squeeze().item()
        fake_score = torch.sigmoid(torch.tensor(logit)).item()
    processing_ms = round((time.perf_counter() - start) * 1000)

    if POSITIVE_CLASS == "real":
        real_score = fake_score
        fake_score = 1.0 - fake_score
    else:
        real_score = 1.0 - fake_score

    label = "Fake" if fake_score >= THRESHOLD else "Real"
    confidence = fake_score if label == "Fake" else real_score

    return jsonify(
        {
            "label": label,
            "confidence": confidence,
            "realScore": real_score,
            "fakeScore": fake_score,
            "processingMs": processing_ms,
            "threshold": THRESHOLD,
            "positiveClass": POSITIVE_CLASS,
        }
    )


if __name__ == "__main__":
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    print(f"Loaded model from {MODEL_PATH}")
    print(f"Serving on http://{HOST}:{PORT}")
    print(f"Positive class mapping: {POSITIVE_CLASS}")
    app.run(host=HOST, port=PORT, debug=False)
