from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.model_service import predict, get_metadata

router = APIRouter()


class PredictRequest(BaseModel):
    features: list[float]


@router.post("/predict")
def predict_gesture(req: PredictRequest):
    try:
        return predict(req.features)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/model-info")
def model_info():
    return get_metadata()
