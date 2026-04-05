"""
Agent API Router
FastAPI endpoints for the multi-agent logistics system.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from .delay_agent import predict_delay
from .route_agent import optimize_route, get_all_cities
from .orchestrator import handle_chat

agent_router = APIRouter()


# ── Request Models ──

class DelayRequest(BaseModel):
    """Request body for delay prediction."""
    Vehicle_Type: Optional[str] = "truck"
    Weather: Optional[str] = "clear"
    Traffic_Level: Optional[int] = 5
    Distance_km: Optional[float] = 200
    Origin: Optional[str] = ""
    Destination: Optional[str] = ""
    Package_Weight_kg: Optional[float] = 10
    # Allow extra fields for the ML pipeline
    model_config = {"extra": "allow"}


class RouteConditions(BaseModel):
    weather: Optional[str] = "clear"
    traffic_level: Optional[int] = 5
    avoid: Optional[list[str]] = []


class RouteRequest(BaseModel):
    """Request body for route optimization."""
    source: str
    destination: str
    conditions: Optional[RouteConditions] = None


class ChatRequest(BaseModel):
    """Request body for chatbot."""
    message: str


# ── Endpoints ──

@agent_router.post("/predict-delay")
async def predict_delay_endpoint(request: DelayRequest):
    """
    Predict delay probability for a shipment.
    Uses the existing ML pipeline + heuristic explainability.
    """
    data = request.model_dump()
    result = predict_delay(data)
    return result


@agent_router.post("/optimize-route")
async def optimize_route_endpoint(request: RouteRequest):
    """
    Find optimal route between two cities using Dijkstra's algorithm.
    Supports weather, traffic, and avoidance conditions.
    """
    data = {
        "source": request.source,
        "destination": request.destination,
        "conditions": request.conditions.model_dump() if request.conditions else {},
    }
    result = optimize_route(data)
    return result


@agent_router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Natural language chatbot interface.
    Routes queries to appropriate agents via the orchestrator.
    """
    result = handle_chat(request.message)
    return result


@agent_router.get("/cities")
async def list_cities():
    """
    List all cities in the network with coordinates.
    Used by the frontend map for city markers.
    """
    return {"cities": get_all_cities()}


@agent_router.get("/health")
async def agent_health():
    """Health check for agent services."""
    from .delay_agent import _model_loaded
    return {
        "status": "ok",
        "agents": {
            "delay_prediction": {"status": "active", "ml_model_loaded": _model_loaded},
            "route_optimization": {"status": "active", "algorithm": "dijkstra"},
            "chatbot": {"status": "active", "mode": "rule-based-nlp"},
        },
        "orchestrator": "active",
    }
