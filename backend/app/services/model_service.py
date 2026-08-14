import json
from pathlib import Path

import joblib
import numpy as np

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

_model = None
_labels = None
_metadata = None


def load_model():
    global _model, _labels, _metadata
    if _model is None:
        _model = joblib.load(MODELS_DIR / "gesture_model.joblib")
        with open(MODELS_DIR / "labels.json") as f:
            _labels = json.load(f)
        with open(MODELS_DIR / "model_metadata.json") as f:
            _metadata = json.load(f)
    return _model, _labels, _metadata


def predict(features: list[float]):
    model, labels, _ = load_model()
    if len(features) != 63:
        raise ValueError(f"Expected 63 features, got {len(features)}")

    X = np.array(features).reshape(1, -1)
    probs = model.predict_proba(X)[0]
    pred_idx = int(np.argmax(probs))
    pred_label = model.classes_[pred_idx]
    confidence = float(probs[pred_idx])

    all_probs = {
        cls: float(p) for cls, p in zip(model.classes_, probs)
    }

    return {
        "gesture": pred_label,
        "confidence": confidence,
        "probabilities": all_probs,
    }


def get_metadata():
    _, _, metadata = load_model()
    return metadata
