# Gesture Intelligence Lab

Real-time computer vision and custom machine-learning gesture recognition, built with MediaPipe, scikit-learn, FastAPI, and Next.js.

## What it is

A hand gesture recognition system that detects 7 gestures (OPEN_PALM, FIST, POINT, PINCH, PEACE, THUMBS_UP, THUMBS_DOWN) from a live webcam feed and uses them to control two interactive experiences: a gesture-driven drawing canvas and a particle fireworks display.

Unlike demos that rely on MediaPipe's built-in gesture classifier, this project trains its own classifier from scratch on a self-collected dataset.

## Architecture

```
Browser webcam
  -> MediaPipe HandLandmarker (WASM, in-browser) -> 21 hand landmarks
  -> Normalization (wrist-relative, scale-invariant) -> 63-value feature vector
  -> POST to Next.js API route (/api/predict)
  -> FastAPI backend -> trained RandomForestClassifier
  -> gesture + confidence + per-class probabilities
  -> back to browser -> drives UI / drawing / fireworks
```

Landmark detection runs entirely client-side. Classification runs server-side via FastAPI, called through a Next.js API route (avoids CORS issues between the frontend and backend domains).

## Machine learning

- **Model**: RandomForestClassifier (scikit-learn), 200 estimators
- **Dataset**: 941 self-collected samples across 7 gestures, collected via a custom in-browser data collection tool (`/collect`) since the training environment (GitHub Codespaces) has no webcam access
- **Features**: 63 values per sample (21 landmarks x 3 coordinates), normalized relative to the wrist and scaled by hand size for robustness to distance/position
- **Split**: 80/20 stratified train/test
- **Results** (actual, from the trained model — see `ml/models/model_metadata.json`):
  - Accuracy: 98.4%
  - Precision: 98.5%
  - Recall: 98.4%
  - F1 Score: 98.4%

All metrics shown in the app's Model Lab page are read live from this metadata file, not hardcoded.

## Project structure

```
gesture-intelligence-lab/
├── frontend/          Next.js + TypeScript + Tailwind
│   ├── app/
│   │   ├── studio/           landing page for the two experiences
│   │   ├── studio/draw/      gesture-controlled drawing canvas
│   │   ├── studio/fireworks/ gesture-controlled particle fireworks
│   │   ├── collect/          in-browser dataset collection tool
│   │   ├── lab/               live model metrics dashboard
│   │   └── api/               proxy routes to the FastAPI backend
│   ├── hooks/          landmark detection, prediction, shared gesture engine
│   └── lib/            landmark normalization logic
├── backend/            FastAPI
│   └── app/
│       ├── main.py            app entrypoint, CORS
│       ├── routes/predict.py  /predict, /model-info
│       └── services/          model loading and inference
├── ml/                 Python training pipeline (local/dev only)
│   ├── data/           gesture_dataset.csv (941 samples, versioned)
│   ├── scripts/train.py       loads data, trains, evaluates, exports
│   └── models/         gesture_model.joblib, labels.json, model_metadata.json
```

## Gestures and controls

| Gesture | Drawing Mode | Fireworks Mode |
|---|---|---|
| POINT | Draw | Launch small burst |
| FIST | Clear canvas | Clear particles |
| PEACE | Cycle brush color | Cycle color palette |
| THUMBS_UP | Save drawing as PNG | Launch large burst |

## Running locally

**Backend:**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
# .env.local: BACKEND_URL=http://localhost:8000
npm run dev
```

**Retraining the model:**
```bash
cd ml
source ../backend/.venv/bin/activate  # or a separate ml venv
python scripts/train.py
```
Outputs land in `ml/models/`; copy them into `backend/app/models/` to update the live classifier.

## Deployment

- **Frontend**: Vercel (`frontend/` as root directory)
- **Backend**: Render (`backend/` as root directory), free tier — spins down after inactivity, first request after idle may take 30-60s to respond

Environment variable required on Vercel: `BACKEND_URL` set to the deployed Render URL.

## Privacy

Webcam frames never leave the browser. Only normalized numeric landmark coordinates (not images) are sent to the backend for classification. No raw video or images are stored anywhere in the pipeline.

## Honest scope notes

This is a from-scratch personal project, not a production system. The original design doc for this project outlined a broader feature set (custom in-app gesture training, presentation control demo, cursor-control sandbox, mobile optimization). What's actually built and live is the scope above — hand tracking, a real trained classifier, and two gesture-controlled creative experiences. Model metrics are real and reproducible from the versioned dataset.
