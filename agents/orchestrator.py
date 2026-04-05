"""
Agent Orchestrator
Central coordinator that routes user requests to the correct agent
and ensures agents can communicate with each other.
"""

from .chatbot_agent import (
    classify_intent,
    build_delay_context,
    build_route_context,
    get_delivery_status,
    generate_help_response,
    extract_cities,
    extract_weather,
)
from .delay_agent import predict_delay
from .route_agent import optimize_route


def handle_chat(message: str) -> dict:
    """
    Main orchestrator entry point.
    Parses intent, routes to correct agent(s), combines results.
    """
    intent = classify_intent(message)

    if intent == "general_help":
        return generate_help_response()

    if intent == "delivery_status":
        return _handle_delivery_status(message)

    if intent == "check_delay":
        return _handle_delay_check(message)

    if intent == "optimize_route":
        return _handle_route_optimization(message)

    if intent == "fleet_status":
        return _handle_fleet_status(message)

    # Fallback
    return generate_help_response()


def _handle_delay_check(message: str) -> dict:
    """Handle delay prediction queries."""
    context = build_delay_context(message)
    delay_result = predict_delay(context)

    # Also check if route optimization would help
    cities = extract_cities(message)
    route_suggestion = None
    if len(cities) >= 2:
        route_data = {
            "source": cities[0],
            "destination": cities[1],
            "conditions": {
                "weather": extract_weather(message),
                "traffic_level": context.get("traffic_level", 5),
            }
        }
        route_result = optimize_route(route_data)
        if "error" not in route_result:
            route_suggestion = route_result

    # Build natural language response
    prob_pct = int(delay_result["probability"] * 100)
    status_emoji = "🔴" if prob_pct >= 65 else "🟡" if prob_pct >= 35 else "🟢"

    response_parts = [
        f"{status_emoji} **Delay Probability: {prob_pct}%** — {delay_result['status']}\n"
    ]

    if delay_result["reasons"]:
        response_parts.append("**Contributing Factors:**")
        for reason in delay_result["reasons"]:
            response_parts.append(f"  • {reason}")

    if route_suggestion and route_suggestion.get("best_route"):
        best = route_suggestion["best_route"]
        response_parts.append(
            f"\n🗺️ **Suggested Route:** {' → '.join(best['path'])} "
            f"({best['distance_km']} km, ~{best['estimated_hours']}h)"
        )
        if route_suggestion.get("alternatives"):
            alt = route_suggestion["alternatives"][0]
            response_parts.append(
                f"  📍 Alternative: {' → '.join(alt['path'])} "
                f"({alt['distance_km']} km, ~{alt['estimated_hours']}h)"
            )

    response = "\n".join(response_parts)

    suggestions = [
        "Show alternate routes",
        "Check weather forecast",
        "Track vehicle live",
    ]
    if len(cities) >= 2:
        suggestions.insert(0, f"Optimize route from {cities[0]} to {cities[1]}")

    return {
        "response": response,
        "agent_used": "delay_prediction" + (" + route_optimization" if route_suggestion else ""),
        "data": {
            "delay": delay_result,
            "route": route_suggestion,
        },
        "suggestions": suggestions,
    }


def _handle_route_optimization(message: str) -> dict:
    """Handle route optimization queries."""
    context = build_route_context(message)

    if "error" in context:
        cities = extract_cities(message)
        if len(cities) == 1:
            return {
                "response": (
                    f"I found the city **{cities[0]}** in your message. "
                    f"Please also specify a destination city.\n\n"
                    f"Example: \"Find route from {cities[0]} to Delhi\""
                ),
                "agent_used": "chatbot",
                "data": None,
                "suggestions": [
                    f"Route from {cities[0]} to Mumbai",
                    f"Route from {cities[0]} to Delhi",
                    f"Route from {cities[0]} to Bengaluru",
                ]
            }
        return {
            "response": "Please specify source and destination cities.\nExample: \"Find route from Mumbai to Delhi\"",
            "agent_used": "chatbot",
            "data": None,
            "suggestions": [
                "Route from Mumbai to Delhi",
                "Route from Bengaluru to Chennai",
                "Route from Delhi to Kolkata",
            ]
        }

    route_result = optimize_route(context)

    if "error" in route_result:
        return {
            "response": f"❌ {route_result['error']}",
            "agent_used": "route_optimization",
            "data": route_result,
            "suggestions": ["Try a different route", "Show available cities"],
        }

    best = route_result["best_route"]
    response_parts = [
        f"🗺️ **Best Route: {context['source']} → {context['destination']}**\n",
        f"📍 **Path:** {' → '.join(best['path'])}",
        f"📏 **Distance:** {best['distance_km']} km",
        f"⏱️ **Estimated Time:** {best['estimated_hours']} hours",
    ]

    if route_result.get("conditions_applied"):
        response_parts.append(f"\n⚙️ **Conditions:** {', '.join(route_result['conditions_applied'])}")

    if route_result.get("alternatives"):
        response_parts.append("\n📋 **Alternative Routes:**")
        for i, alt in enumerate(route_result["alternatives"], 1):
            note = f" ({alt['note']})" if alt.get('note') else ""
            response_parts.append(
                f"  {i}. {' → '.join(alt['path'])} — "
                f"{alt['distance_km']} km, ~{alt['estimated_hours']}h{note}"
            )

    # Also predict delay for this route
    delay_data = {
        "distance_km": best["distance_km"],
        "vehicle_type": "truck",
        "weather": context["conditions"].get("weather", "clear"),
        "traffic_level": context["conditions"].get("traffic_level", 5),
    }
    delay_result = predict_delay(delay_data)
    prob_pct = int(delay_result["probability"] * 100)
    status_emoji = "🔴" if prob_pct >= 65 else "🟡" if prob_pct >= 35 else "🟢"
    response_parts.append(
        f"\n{status_emoji} **Delay Risk:** {prob_pct}% — {delay_result['status']}"
    )

    response = "\n".join(response_parts)

    return {
        "response": response,
        "agent_used": "route_optimization + delay_prediction",
        "data": {
            "route": route_result,
            "delay": delay_result,
        },
        "suggestions": [
            f"Predict delay for {context['source']} to {context['destination']}",
            "Show in stormy weather",
            "Show in heavy traffic",
            "Track live vehicles",
        ]
    }


def _handle_delivery_status(message: str) -> dict:
    """Handle delivery status queries."""
    status = get_delivery_status(message)

    if status.get("found"):
        load = status["load_id"]
        response_parts = [
            f"📦 **Shipment {load}**\n",
            f"🛣️ **Route:** {status['route']}",
            f"📊 **Status:** {status['status']}",
            f"👤 **Driver:** {status['driver']}",
            f"⏰ **ETA:** {status['eta']}",
            f"📈 **Progress:** {status['progress']}%",
        ]
        if status["status"] == "Delayed":
            response_parts.append("\n⚠️ This shipment is currently experiencing delays.")
            # Get delay prediction
            cities = status["route"].split(" → ")
            if len(cities) == 2:
                delay = predict_delay({
                    "origin": cities[0].strip(),
                    "destination": cities[1].strip(),
                    "distance_km": 300,
                    "vehicle_type": "truck",
                    "weather": "rainy",
                    "traffic_level": 7,
                })
                response_parts.append(f"🔮 Delay probability: {int(delay['probability'] * 100)}%")
                for reason in delay["reasons"][:2]:
                    response_parts.append(f"  • {reason}")

        return {
            "response": "\n".join(response_parts),
            "agent_used": "delivery_status" + (" + delay_prediction" if status["status"] == "Delayed" else ""),
            "data": status,
            "suggestions": [
                f"Optimize route for {load}",
                f"Predict delay for {load}",
                "Show all delayed shipments",
            ]
        }

    # Summary
    summary = status["summary"]
    delayed_list = status["summary"]["delayed_shipments"]

    response_parts = [
        f"📊 **Delivery Overview**\n",
        f"📦 Total Active: **{summary['total_active']}**",
        f"🚛 In Transit: **{summary['in_transit']}**",
        f"⚠️ Delayed: **{summary['delayed']}**\n",
    ]

    if delayed_list:
        response_parts.append("🔴 **Delayed Shipments:**")
        for load_id, info in delayed_list.items():
            response_parts.append(f"  • **{load_id}** — {info['route']} (Driver: {info['driver']})")

    return {
        "response": "\n".join(response_parts),
        "agent_used": "delivery_status",
        "data": status,
        "suggestions": [
            "Track LD-4823",
            "Why is LD-4823 delayed?",
            "Optimize route for delayed shipments",
        ]
    }


def _handle_fleet_status(message: str) -> dict:
    """Handle fleet status queries."""
    return {
        "response": (
            "🚛 **Fleet Status Summary**\n\n"
            "📊 **Total Vehicles:** 156\n"
            "✅ **Active:** 89 trucks on the road\n"
            "🔧 **Maintenance:** 23 trucks in service\n"
            "🔴 **Critical:** 5 trucks need immediate attention\n\n"
            "📈 **Fleet Health:** 88% average\n"
            "⛽ **Fuel Cost Today:** ₹37.8L\n\n"
            "Use the Fleet page for detailed vehicle tracking."
        ),
        "agent_used": "chatbot",
        "data": {
            "total": 156, "active": 89,
            "maintenance": 23, "critical": 5,
        },
        "suggestions": [
            "Show vehicle VH-1005 details",
            "Which trucks need maintenance?",
            "Show driver assignments",
        ]
    }
