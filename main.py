print("Main file loaded")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
from agents.router import agent_router

app = FastAPI(title="Logistics AI — Multi-Agent Platform")

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount agent services at /agent/*
app.include_router(agent_router, prefix="/agent", tags=["agents"])

try:
    pipeline = joblib.load("pipeline_model.pkl")
except Exception as e:
    print(f"Warning: Could not load pipeline: {e}")
    pipeline = None

@app.get("/")
def home():
    return {"message": "Logistics AI API is running 🚀"}

@app.post("/predict")
def predict(data: dict):
    if pipeline is not None:
        input_df = pd.DataFrame([data])
        prediction = pipeline.predict(input_df)[0]
    else:
        prediction = 0 # Dummy prediction if model breaks

    result = "Delayed" if prediction == 1 else "On-Time"

    return {
        "prediction": int(prediction),
        "status": result
    }