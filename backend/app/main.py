from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import predict

app = FastAPI(title="Gesture Intelligence Lab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your Vercel domain before final deploy
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(predict.router)


@app.get("/health")
def health():
    return {"status": "ok"}
