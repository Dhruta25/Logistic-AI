"""
Delay Prediction Agent
Wraps the existing pipeline_model.pkl as an intelligent agent service.
Provides delay probability + explainability (top contributing reasons).
"""

import joblib
import pandas as pd
import os

# ── Load the existing ML pipeline ──
_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pipeline_model.pkl")

try:
    _pipeline = joblib.load(_MODEL_PATH)
    _model_loaded = True
except Exception as e:
    print(f"[DelayAgent] Warning: Could not load model from {_MODEL_PATH}: {e}")
    _pipeline = None
    _model_loaded = False


# ── Heuristic risk factors for explainability ──
WEATHER_RISK = {
    "clear": 0.05, "cold": 0.12, "hot": 0.10,
    "foggy": 0.25, "rainy": 0.35, "stormy": 0.55,
}

TRAFFIC_LABELS = {
    1: "very light", 2: "light", 3: "moderate", 4: "moderate-heavy",
    5: "average", 6: "above average", 7: "heavy", 8: "very heavy",
    9: "severe", 10: "gridlock",
}


def predict_delay(data: dict) -> dict:
    """
    Predict delay probability for a shipment.

    Input keys (flexible — agent normalizes):
        Vehicle_Type, Weather, Traffic_Level, Distance_km,
        Origin, Destination, Package_Weight_kg, ...
        (Plus any columns the original ML pipeline expects)

    Returns:
        {
            "prediction": 0 | 1,
            "status": "On-Time" | "Delayed",
            "probability": 0.0–1.0,
            "reasons": [...],
            "confidence": 0.0–1.0,
            "explainability": { factor: contribution }
        }
    """
    # ── Try ML model first ──
    ml_prediction = None
    ml_probability = None

    if _model_loaded and _pipeline is not None:
        try:
            input_df = pd.DataFrame([data])
            ml_prediction = int(_pipeline.predict(input_df)[0])

            # Try to get probability if the model supports it
            if hasattr(_pipeline, "predict_proba"):
                proba = _pipeline.predict_proba(input_df)[0]
                ml_probability = float(proba[1]) if len(proba) > 1 else float(proba[0])
        except Exception as e:
            print(f"[DelayAgent] ML prediction error (using heuristic fallback): {e}")

    # ── Heuristic analysis (always computed for explainability) ──
    weather = str(data.get("Weather", data.get("weather_condition", data.get("weather", "clear")))).lower().strip()
    traffic = int(data.get("Traffic_Level", data.get("traffic_level", 5)))
    distance = float(data.get("Distance_km", data.get("distance_km", 100)))
    weight = float(data.get("Package_Weight_kg", data.get("package_weight_kg", 10)))
    vehicle = str(data.get("Vehicle_Type", data.get("vehicle_type", "truck"))).lower().strip()

    # Compute component risks
    weather_risk = WEATHER_RISK.get(weather, 0.10)
    traffic_risk = min(traffic / 10, 1.0) * 0.4
    distance_risk = min(distance / 800, 1.0) * 0.3
    weight_risk = min(weight / 60, 1.0) * 0.1
    vehicle_risk = 0.15 if vehicle in ("bike", "three wheeler") else 0.05

    # Composite heuristic probability
    heuristic_prob = (
        weather_risk * 0.30 +
        traffic_risk * 0.30 +
        distance_risk * 0.20 +
        weight_risk * 0.10 +
        vehicle_risk * 0.10
    )
    heuristic_prob = min(max(heuristic_prob, 0.02), 0.98)

    # Use ML if available, otherwise heuristic
    if ml_probability is not None:
        probability = ml_probability
        prediction = ml_prediction
        confidence = 0.88
    elif ml_prediction is not None:
        probability = heuristic_prob
        prediction = ml_prediction
        confidence = 0.80
    else:
        probability = heuristic_prob
        prediction = 1 if probability >= 0.45 else 0
        confidence = 0.70

    status = "Delayed" if prediction == 1 else "On-Time"

    # ── Explainability: identify top reasons ──
    reasons = []
    explainability = {}

    if weather_risk >= 0.20:
        reasons.append(f"{weather.capitalize()} weather conditions increasing delay risk by {int(weather_risk * 100)}%")
        explainability["weather"] = round(weather_risk, 3)

    if traffic >= 7:
        reasons.append(f"{TRAFFIC_LABELS.get(traffic, 'heavy')} traffic (level {traffic}/10) causing significant slowdowns")
        explainability["traffic"] = round(traffic_risk, 3)

    if distance > 300:
        reasons.append(f"Long-distance delivery ({int(distance)} km) increases transit uncertainty")
        explainability["distance"] = round(distance_risk, 3)

    if weight > 40:
        reasons.append(f"Heavy package ({int(weight)} kg) may slow loading/handling")
        explainability["weight"] = round(weight_risk, 3)

    if vehicle in ("bike", "three wheeler"):
        reasons.append(f"{vehicle.title()} has lower reliability for this distance")
        explainability["vehicle_type"] = round(vehicle_risk, 3)

    if traffic >= 4 and traffic < 7:
        reasons.append(f"Moderate traffic (level {traffic}/10) may cause minor delays")
        explainability["traffic"] = round(traffic_risk, 3)

    if not reasons:
        reasons.append("No significant risk factors detected — delivery is likely on time")

    return {
        "prediction": prediction,
        "status": status,
        "probability": round(probability, 3),
        "reasons": reasons[:5],
        "confidence": round(confidence, 2),
        "explainability": explainability,
    }
