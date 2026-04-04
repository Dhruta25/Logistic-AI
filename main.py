print("Main file loaded")
from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

pipeline = joblib.load("pipeline_model.pkl")

@app.get("/")
def home():
    return {"message": "Logistics AI API is running 🚀"}

@app.post("/predict")
def predict(data: dict):

    input_df = pd.DataFrame([data])

    prediction = pipeline.predict(input_df)[0]

    result = "Delayed" if prediction == 1 else "On-Time"

    return {
        "prediction": int(prediction),
        "status": result
    }