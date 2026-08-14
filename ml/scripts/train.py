import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "gesture_dataset.csv"
MODELS_DIR = ROOT / "models"


def main():
    if not DATA_PATH.exists():
        print(f"Dataset not found at {DATA_PATH}")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} samples, {df['label'].nunique()} gestures")
    print(df["label"].value_counts())

    before = len(df)
    df = df.dropna()
    df = df[~df.isin([float("inf"), float("-inf")]).any(axis=1)]
    dropped = before - len(df)
    if dropped:
        print(f"Dropped {dropped} invalid rows")

    X = df.drop(columns=["label"])
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train: {len(X_train)}  Test: {len(X_test)}")

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="macro")
    recall = recall_score(y_test, y_pred, average="macro")
    f1 = f1_score(y_test, y_pred, average="macro")
    labels_sorted = sorted(y.unique())
    cm = confusion_matrix(y_test, y_pred, labels=labels_sorted)

    print("\n--- Evaluation ---")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("\nConfusion matrix (rows=true, cols=pred):")
    print(labels_sorted)
    print(cm)
    print("\n" + classification_report(y_test, y_pred))

    MODELS_DIR.mkdir(exist_ok=True)
    joblib.dump(model, MODELS_DIR / "gesture_model.joblib")

    with open(MODELS_DIR / "labels.json", "w") as f:
        json.dump(labels_sorted, f, indent=2)

    metadata = {
        "model_type": "RandomForestClassifier",
        "training_date": datetime.now(timezone.utc).isoformat(),
        "gesture_labels": labels_sorted,
        "num_gestures": len(labels_sorted),
        "feature_count": X.shape[1],
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
        },
        "confusion_matrix": {
            "labels": labels_sorted,
            "matrix": cm.tolist(),
        },
    }
    with open(MODELS_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved model to {MODELS_DIR}")


if __name__ == "__main__":
    main()
