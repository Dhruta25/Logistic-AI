"""
Route Optimization Agent
Uses Dijkstra's algorithm on the Indian city graph to find optimal routes.
Supports dynamic re-routing based on weather, traffic, and avoidance constraints.
"""

from .city_graph import city_graph, CITIES, WEATHER_MODIFIERS


def _normalize_city(name: str) -> str | None:
    """Fuzzy match a city name to the graph."""
    name_lower = name.strip().lower()
    for city in CITIES:
        if city.lower() == name_lower:
            return city
    # Partial match
    for city in CITIES:
        if name_lower in city.lower() or city.lower() in name_lower:
            return city
    return None


def optimize_route(data: dict) -> dict:
    """
    Find optimal route between source and destination.

    Input:
        {
            "source": "Mumbai",
            "destination": "Delhi",
            "conditions": {
                "weather": "foggy",         # optional
                "traffic_level": 6,         # optional 1-10
                "avoid": ["Jaipur"]         # optional cities to avoid
            }
        }

    Returns:
        {
            "best_route": { path, distance_km, estimated_hours, waypoints },
            "alternatives": [...],
            "conditions_applied": [...],
            "source_info": { city, lat, lng },
            "destination_info": { city, lat, lng },
        }
    """
    source_raw = data.get("source", "")
    dest_raw = data.get("destination", "")
    conditions = data.get("conditions", {})

    source = _normalize_city(source_raw)
    dest = _normalize_city(dest_raw)

    if not source:
        return {"error": f"Unknown source city: '{source_raw}'", "available_cities": sorted(CITIES.keys())}
    if not dest:
        return {"error": f"Unknown destination city: '{dest_raw}'", "available_cities": sorted(CITIES.keys())}
    if source == dest:
        return {"error": "Source and destination are the same city"}

    weather = str(conditions.get("weather", "clear")).lower().strip()
    traffic_level = int(conditions.get("traffic_level", 5))
    avoid_cities = conditions.get("avoid", [])

    # Normalize avoid list
    normalized_avoid = []
    for city in avoid_cities:
        norm = _normalize_city(city)
        if norm and norm not in (source, dest):
            normalized_avoid.append(norm)

    # Conditions log
    conditions_applied = []
    if weather != "clear":
        modifier = WEATHER_MODIFIERS.get(weather, 1.0)
        conditions_applied.append(
            f"{weather.capitalize()} weather: speed reduced by {int((1 - modifier) * 100)}%"
        )
    if traffic_level > 5:
        conditions_applied.append(f"Traffic level {traffic_level}/10: moderate-to-heavy congestion")
    elif traffic_level > 7:
        conditions_applied.append(f"Traffic level {traffic_level}/10: severe congestion")
    if normalized_avoid:
        conditions_applied.append(f"Avoiding: {', '.join(normalized_avoid)}")

    # ── Find best route ──
    best = city_graph.dijkstra(
        source, dest,
        weather=weather,
        traffic_level=traffic_level,
        avoid_cities=normalized_avoid,
    )

    if not best:
        return {
            "error": f"No route found from {source} to {dest}",
            "conditions_applied": conditions_applied,
        }

    # ── Find alternatives ──
    alternatives = city_graph.find_alternatives(
        source, dest,
        weather=weather,
        traffic_level=traffic_level,
        count=2,
    )
    # Filter out routes that match the best
    alternatives = [a for a in alternatives if a["path"] != best["path"]]

    return {
        "best_route": best,
        "alternatives": alternatives,
        "conditions_applied": conditions_applied if conditions_applied else ["Standard conditions — no modifiers applied"],
        "source_info": {
            "city": source,
            "lat": CITIES[source]["lat"],
            "lng": CITIES[source]["lng"],
        },
        "destination_info": {
            "city": dest,
            "lat": CITIES[dest]["lat"],
            "lng": CITIES[dest]["lng"],
        },
    }


def get_all_cities() -> list[dict]:
    """Return all cities with coordinates for map display."""
    return [
        {"city": name, "lat": info["lat"], "lng": info["lng"], "region": info["region"]}
        for name, info in CITIES.items()
    ]
