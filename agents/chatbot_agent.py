"""
Chatbot Agent — Natural Language Interface
Parses user queries, classifies intent, and routes to appropriate agents.
Uses rule-based NLP for zero-cost, offline-ready operation.
"""

import re


# ── Intent patterns ──
INTENT_PATTERNS = {
    "check_delay": [
        r"delay", r"late", r"delayed", r"on.?time", r"why.+delay",
        r"predict.+delay", r"risk", r"probability", r"eta",
    ],
    "optimize_route": [
        r"route", r"best.+route", r"fastest", r"shortest", r"path",
        r"alternate", r"reroute", r"re-route", r"optimize",
        r"how.+to.+get", r"directions?", r"navigate",
    ],
    "delivery_status": [
        r"status", r"where.+is", r"track", r"delivery.*status",
        r"show.*delivery", r"current.*location", r"shipment",
    ],
    "fleet_status": [
        r"fleet", r"truck", r"vehicle", r"driver",
        r"how.+many.+truck", r"available.+vehicle",
    ],
    "general_help": [
        r"help", r"what.+can", r"capabilities", r"commands?",
    ],
}

# ── City extraction patterns ──
CITY_ALIASES = {
    "delhi": "Delhi", "new delhi": "Delhi", "ncr": "Delhi",
    "mumbai": "Mumbai", "bombay": "Mumbai",
    "bengaluru": "Bengaluru", "bangalore": "Bengaluru",
    "chennai": "Chennai", "madras": "Chennai",
    "kolkata": "Kolkata", "calcutta": "Kolkata",
    "hyderabad": "Hyderabad",
    "pune": "Pune", "ahmedabad": "Ahmedabad",
    "jaipur": "Jaipur", "lucknow": "Lucknow",
    "chandigarh": "Chandigarh", "amritsar": "Amritsar",
    "surat": "Surat", "vadodara": "Vadodara",
    "indore": "Indore", "bhopal": "Bhopal",
    "nagpur": "Nagpur", "patna": "Patna",
    "varanasi": "Varanasi", "agra": "Agra",
    "goa": "Goa", "kochi": "Kochi", "cochin": "Kochi",
    "coimbatore": "Coimbatore", "mysuru": "Mysuru", "mysore": "Mysuru",
    "vijayawada": "Vijayawada", "visakhapatnam": "Visakhapatnam", "vizag": "Visakhapatnam",
    "udaipur": "Udaipur", "jodhpur": "Jodhpur",
    "nashik": "Nashik", "hubli": "Hubli",
    "mangaluru": "Mangaluru", "mangalore": "Mangaluru",
    "raipur": "Raipur", "ranchi": "Ranchi",
    "bhubaneswar": "Bhubaneswar", "guwahati": "Guwahati",
    "dehradun": "Dehradun", "madurai": "Madurai",
    "thiruvananthapuram": "Thiruvananthapuram", "trivandrum": "Thiruvananthapuram",
    "kanpur": "Kanpur",
}

# ── Weather extraction ──
WEATHER_KEYWORDS = {
    "rainy": "rainy", "rain": "rainy", "raining": "rainy",
    "stormy": "stormy", "storm": "stormy", "thunderstorm": "stormy",
    "foggy": "foggy", "fog": "foggy", "mist": "foggy",
    "cold": "cold", "winter": "cold", "snow": "cold",
    "hot": "hot", "summer": "hot", "heat": "hot",
    "clear": "clear", "sunny": "clear", "good weather": "clear",
}


def classify_intent(message: str) -> str:
    """Classify user intent from message text."""
    msg_lower = message.lower().strip()

    # Score each intent
    scores = {}
    for intent, patterns in INTENT_PATTERNS.items():
        score = sum(1 for p in patterns if re.search(p, msg_lower))
        if score > 0:
            scores[intent] = score

    if not scores:
        return "general_help"

    return max(scores, key=scores.get)


def extract_cities(message: str) -> list[str]:
    """Extract city names from message."""
    msg_lower = message.lower()
    found = []
    # Sort by length (longest first) to match "new delhi" before "delhi"
    for alias in sorted(CITY_ALIASES.keys(), key=len, reverse=True):
        if alias in msg_lower:
            city = CITY_ALIASES[alias]
            if city not in found:
                found.append(city)
            # Remove matched text to avoid double-matching
            msg_lower = msg_lower.replace(alias, " ")
    return found


def extract_weather(message: str) -> str:
    """Extract weather condition from message."""
    msg_lower = message.lower()
    for keyword, condition in WEATHER_KEYWORDS.items():
        if keyword in msg_lower:
            return condition
    return "clear"


def extract_shipment_data(message: str) -> dict:
    """Extract structured shipment data from natural language."""
    data = {}

    # Distance
    dist_match = re.search(r'(\d+)\s*(km|kilometer|kilometres)', message.lower())
    if dist_match:
        data["distance_km"] = int(dist_match.group(1))

    # Weight
    weight_match = re.search(r'(\d+\.?\d*)\s*(kg|kilo)', message.lower())
    if weight_match:
        data["package_weight_kg"] = float(weight_match.group(1))

    # Vehicle type
    for vtype in ["bike", "truck", "van", "ev van", "three wheeler"]:
        if vtype in message.lower():
            data["vehicle_type"] = vtype
            break

    # Traffic level
    traffic_match = re.search(r'traffic\s*(?:level)?\s*(\d+)', message.lower())
    if traffic_match:
        data["traffic_level"] = min(int(traffic_match.group(1)), 10)

    # Weather
    weather = extract_weather(message)
    if weather != "clear":
        data["weather"] = weather

    # Cities
    cities = extract_cities(message)
    if len(cities) >= 1:
        data["origin"] = cities[0]
    if len(cities) >= 2:
        data["destination"] = cities[1]

    return data


def build_delay_context(message: str) -> dict:
    """Build context for delay prediction from user message."""
    data = extract_shipment_data(message)
    cities = extract_cities(message)

    # Set defaults for missing fields
    data.setdefault("distance_km", 200)
    data.setdefault("vehicle_type", "truck")
    data.setdefault("weather", extract_weather(message))
    data.setdefault("traffic_level", 5)

    if cities:
        data["origin"] = cities[0]
        if len(cities) >= 2:
            data["destination"] = cities[1]

    return data


def build_route_context(message: str) -> dict:
    """Build context for route optimization from user message."""
    cities = extract_cities(message)
    weather = extract_weather(message)

    if len(cities) < 2:
        return {"error": "Please specify both source and destination cities."}

    return {
        "source": cities[0],
        "destination": cities[1],
        "conditions": {
            "weather": weather,
            "traffic_level": 5,
            "avoid": cities[2:] if len(cities) > 2 else [],
        }
    }


# ── Simulated delivery statuses ──
MOCK_DELIVERIES = {
    "LD-4821": {"route": "Delhi → Jaipur", "status": "In Transit", "driver": "Rajesh K.", "eta": "2:30 PM", "progress": 72},
    "LD-4822": {"route": "Mumbai → Pune", "status": "Pending", "driver": "Suresh P.", "eta": "3:15 PM", "progress": 35},
    "LD-4823": {"route": "Bengaluru → Chennai", "status": "Delayed", "driver": "Vikram S.", "eta": "5:00 PM", "progress": 58},
    "LD-4824": {"route": "Kolkata → Patna", "status": "Delivered", "driver": "Anita D.", "eta": "1:45 PM", "progress": 100},
    "LD-4825": {"route": "Hyderabad → Vijayawada", "status": "In Transit", "driver": "Mahesh R.", "eta": "4:20 PM", "progress": 44},
}


def get_delivery_status(message: str) -> dict:
    """Get delivery status for a specific shipment or all shipments."""
    msg_upper = message.upper()

    # Check for specific load ID
    for load_id, info in MOCK_DELIVERIES.items():
        if load_id in msg_upper:
            return {
                "found": True,
                "load_id": load_id,
                **info,
            }

    # Return summary of delayed/at-risk deliveries
    delayed = {k: v for k, v in MOCK_DELIVERIES.items() if v["status"] == "Delayed"}
    in_transit = {k: v for k, v in MOCK_DELIVERIES.items() if v["status"] == "In Transit"}

    return {
        "found": False,
        "summary": {
            "total_active": len(MOCK_DELIVERIES),
            "delayed": len(delayed),
            "in_transit": len(in_transit),
            "delayed_shipments": delayed,
            "in_transit_shipments": in_transit,
        }
    }


def generate_help_response() -> dict:
    """Generate a help/capabilities response."""
    return {
        "response": (
            "👋 Hi! I'm the Logistics AI Assistant. Here's what I can help with:\n\n"
            "🔮 **Delay Prediction** — Ask me about delay risks for any shipment\n"
            "   e.g., \"What's the delay risk for a truck delivery from Mumbai to Delhi in rain?\"\n\n"
            "🗺️ **Route Optimization** — Find the best routes between cities\n"
            "   e.g., \"Find the fastest route from Bengaluru to Chennai\"\n\n"
            "📦 **Delivery Status** — Check shipment status\n"
            "   e.g., \"Show delivery status\" or \"Track LD-4821\"\n\n"
            "💡 Just type your question naturally — I'll figure out what you need!"
        ),
        "agent_used": "chatbot",
        "data": None,
        "suggestions": [
            "What's the delay risk for Mumbai to Pune delivery?",
            "Find fastest route from Delhi to Bengaluru",
            "Show delivery status",
            "Why is LD-4823 delayed?",
        ]
    }
