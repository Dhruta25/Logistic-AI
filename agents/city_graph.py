"""
Indian City Road Network Graph
~40 major cities with lat/lng and ~80 road connections with distances.
Used by route_agent for Dijkstra pathfinding and the frontend map.
"""

import heapq
from typing import Optional

# ────────────────────────────────────────
# City Nodes: name → { lat, lng, region }
# ────────────────────────────────────────
CITIES = {
    "Delhi":        {"lat": 28.6139, "lng": 77.2090, "region": "north"},
    "Mumbai":       {"lat": 19.0760, "lng": 72.8777, "region": "west"},
    "Bengaluru":    {"lat": 12.9716, "lng": 77.5946, "region": "south"},
    "Chennai":      {"lat": 13.0827, "lng": 80.2707, "region": "south"},
    "Kolkata":      {"lat": 22.5726, "lng": 88.3639, "region": "east"},
    "Hyderabad":    {"lat": 17.3850, "lng": 78.4867, "region": "south"},
    "Pune":         {"lat": 18.5204, "lng": 73.8567, "region": "west"},
    "Ahmedabad":    {"lat": 23.0225, "lng": 72.5714, "region": "west"},
    "Jaipur":       {"lat": 26.9124, "lng": 75.7873, "region": "north"},
    "Lucknow":      {"lat": 26.8467, "lng": 80.9462, "region": "north"},
    "Chandigarh":   {"lat": 30.7333, "lng": 76.7794, "region": "north"},
    "Amritsar":     {"lat": 31.6340, "lng": 74.8723, "region": "north"},
    "Surat":        {"lat": 21.1702, "lng": 72.8311, "region": "west"},
    "Vadodara":     {"lat": 22.3072, "lng": 73.1812, "region": "west"},
    "Indore":       {"lat": 22.7196, "lng": 75.8577, "region": "central"},
    "Bhopal":       {"lat": 23.2599, "lng": 77.4126, "region": "central"},
    "Nagpur":       {"lat": 21.1458, "lng": 79.0882, "region": "central"},
    "Patna":        {"lat": 25.6093, "lng": 85.1376, "region": "east"},
    "Varanasi":     {"lat": 25.3176, "lng": 82.9739, "region": "north"},
    "Agra":         {"lat": 27.1767, "lng": 78.0081, "region": "north"},
    "Kanpur":       {"lat": 26.4499, "lng": 80.3319, "region": "north"},
    "Nashik":       {"lat": 19.9975, "lng": 73.7898, "region": "west"},
    "Vijayawada":   {"lat": 16.5062, "lng": 80.6480, "region": "south"},
    "Visakhapatnam":{"lat": 17.6868, "lng": 83.2185, "region": "south"},
    "Coimbatore":   {"lat": 11.0168, "lng": 76.9558, "region": "south"},
    "Kochi":        {"lat":  9.9312, "lng": 76.2673, "region": "south"},
    "Udaipur":      {"lat": 24.5854, "lng": 73.7125, "region": "north"},
    "Jodhpur":      {"lat": 26.2389, "lng": 73.0243, "region": "north"},
    "Goa":          {"lat": 15.2993, "lng": 74.1240, "region": "west"},
    "Hubli":        {"lat": 15.3647, "lng": 75.1240, "region": "south"},
    "Mysuru":       {"lat": 12.2958, "lng": 76.6394, "region": "south"},
    "Mangaluru":    {"lat": 12.9141, "lng": 74.8560, "region": "south"},
    "Raipur":       {"lat": 21.2514, "lng": 81.6296, "region": "central"},
    "Ranchi":       {"lat": 23.3441, "lng": 85.3096, "region": "east"},
    "Bhubaneswar":  {"lat": 20.2961, "lng": 85.8245, "region": "east"},
    "Guwahati":     {"lat": 26.1445, "lng": 91.7362, "region": "north-east"},
    "Dehradun":     {"lat": 30.3165, "lng": 78.0322, "region": "north"},
    "Thiruvananthapuram": {"lat": 8.5241, "lng": 76.9366, "region": "south"},
    "Madurai":      {"lat":  9.9252, "lng": 78.1198, "region": "south"},
}

# ────────────────────────────────────────
# Road Edges: (city_a, city_b, distance_km, avg_speed_kmh, road_quality 1-10)
# ────────────────────────────────────────
ROADS = [
    # North India
    ("Delhi", "Jaipur", 280, 65, 8),
    ("Delhi", "Agra", 230, 70, 9),
    ("Delhi", "Chandigarh", 250, 70, 9),
    ("Delhi", "Dehradun", 255, 55, 7),
    ("Delhi", "Lucknow", 555, 65, 8),
    ("Chandigarh", "Amritsar", 230, 60, 8),
    ("Chandigarh", "Dehradun", 170, 50, 6),
    ("Jaipur", "Udaipur", 395, 55, 7),
    ("Jaipur", "Jodhpur", 335, 60, 7),
    ("Jaipur", "Agra", 240, 65, 8),
    ("Agra", "Kanpur", 280, 60, 7),
    ("Agra", "Lucknow", 335, 60, 7),
    ("Lucknow", "Kanpur", 85, 65, 8),
    ("Lucknow", "Varanasi", 320, 55, 7),
    ("Lucknow", "Patna", 535, 55, 6),
    ("Varanasi", "Patna", 290, 50, 6),

    # West India
    ("Mumbai", "Pune", 150, 60, 9),
    ("Mumbai", "Nashik", 170, 55, 8),
    ("Mumbai", "Surat", 300, 65, 8),
    ("Mumbai", "Goa", 580, 55, 7),
    ("Pune", "Nashik", 210, 55, 7),
    ("Pune", "Goa", 460, 50, 7),
    ("Surat", "Vadodara", 165, 65, 8),
    ("Surat", "Ahmedabad", 265, 65, 8),
    ("Vadodara", "Ahmedabad", 110, 70, 9),
    ("Ahmedabad", "Udaipur", 260, 55, 7),
    ("Ahmedabad", "Indore", 400, 55, 7),

    # Central India
    ("Indore", "Bhopal", 195, 60, 8),
    ("Indore", "Nashik", 380, 50, 6),
    ("Bhopal", "Nagpur", 350, 55, 7),
    ("Bhopal", "Agra", 520, 55, 6),
    ("Nagpur", "Raipur", 285, 55, 7),
    ("Nagpur", "Hyderabad", 500, 55, 7),
    ("Nagpur", "Pune", 710, 50, 6),

    # South India
    ("Bengaluru", "Chennai", 350, 60, 8),
    ("Bengaluru", "Mysuru", 150, 60, 9),
    ("Bengaluru", "Hyderabad", 570, 60, 8),
    ("Bengaluru", "Hubli", 400, 55, 7),
    ("Bengaluru", "Coimbatore", 365, 55, 7),
    ("Bengaluru", "Mangaluru", 350, 50, 6),
    ("Chennai", "Vijayawada", 380, 55, 7),
    ("Chennai", "Coimbatore", 510, 55, 7),
    ("Chennai", "Madurai", 460, 55, 7),
    ("Hyderabad", "Vijayawada", 275, 60, 8),
    ("Hyderabad", "Visakhapatnam", 620, 55, 7),
    ("Vijayawada", "Visakhapatnam", 350, 55, 7),
    ("Coimbatore", "Kochi", 190, 50, 7),
    ("Coimbatore", "Madurai", 220, 55, 7),
    ("Kochi", "Thiruvananthapuram", 205, 50, 7),
    ("Madurai", "Thiruvananthapuram", 310, 50, 6),
    ("Goa", "Hubli", 190, 50, 7),
    ("Hubli", "Mangaluru", 300, 45, 6),
    ("Mysuru", "Mangaluru", 260, 45, 6),
    ("Mysuru", "Coimbatore", 210, 55, 7),

    # East India
    ("Kolkata", "Patna", 590, 50, 6),
    ("Kolkata", "Bhubaneswar", 440, 55, 7),
    ("Kolkata", "Ranchi", 400, 45, 6),
    ("Patna", "Ranchi", 320, 45, 6),
    ("Bhubaneswar", "Visakhapatnam", 450, 55, 7),
    ("Ranchi", "Raipur", 500, 45, 5),
    ("Ranchi", "Nagpur", 620, 45, 5),

    # North-East
    ("Kolkata", "Guwahati", 985, 45, 5),
    ("Patna", "Guwahati", 890, 40, 5),

    # Cross-regional connectors
    ("Delhi", "Bhopal", 775, 55, 7),
    ("Jaipur", "Ahmedabad", 660, 55, 7),
    ("Hyderabad", "Pune", 560, 55, 7),
    ("Raipur", "Bhubaneswar", 510, 50, 6),
]

# ────────────────────────────────────────
# Weather modifiers: condition → speed multiplier (< 1 means slower)
# ────────────────────────────────────────
WEATHER_MODIFIERS = {
    "clear":  1.0,
    "cold":   0.90,
    "hot":    0.95,
    "foggy":  0.70,
    "rainy":  0.65,
    "stormy": 0.45,
}

# Traffic multiplier: 1-10 scale → speed multiplier
def traffic_modifier(level: int) -> float:
    """Convert traffic level (1-10) to speed multiplier."""
    return max(0.3, 1.0 - (level - 1) * 0.08)


class CityGraph:
    """
    Weighted graph of Indian cities for route optimization.
    Supports Dijkstra shortest path with dynamic condition modifiers.
    """

    def __init__(self):
        self.adjacency: dict[str, list[tuple[str, float, dict]]] = {}
        self._build_graph()

    def _build_graph(self):
        """Build adjacency list from ROADS data."""
        for city_a, city_b, dist, speed, quality in ROADS:
            edge_data = {
                "distance_km": dist,
                "base_speed_kmh": speed,
                "road_quality": quality,
            }
            self.adjacency.setdefault(city_a, []).append((city_b, dist, edge_data))
            self.adjacency.setdefault(city_b, []).append((city_a, dist, edge_data))

    def get_edge_time(
        self,
        edge_data: dict,
        weather: str = "clear",
        traffic_level: int = 5,
    ) -> float:
        """Calculate travel time (hours) for an edge given conditions."""
        speed = edge_data["base_speed_kmh"]
        speed *= WEATHER_MODIFIERS.get(weather, 1.0)
        speed *= traffic_modifier(traffic_level)
        speed = max(speed, 10)  # minimum 10 km/h
        return edge_data["distance_km"] / speed

    def dijkstra(
        self,
        source: str,
        destination: str,
        weather: str = "clear",
        traffic_level: int = 5,
        avoid_cities: Optional[list[str]] = None,
    ) -> Optional[dict]:
        """
        Find shortest path (by time) between two cities.
        Returns dict with path, distance, time, waypoints.
        """
        if source not in self.adjacency or destination not in self.adjacency:
            return None

        avoid = set(avoid_cities or [])
        # {city: (total_time, total_dist, predecessor)}
        best = {source: (0.0, 0.0, None)}
        # Priority queue: (total_time, city)
        pq = [(0.0, source)]
        visited = set()

        while pq:
            current_time, current = heapq.heappop(pq)
            if current in visited:
                continue
            visited.add(current)

            if current == destination:
                break

            for neighbor, dist, edge_data in self.adjacency.get(current, []):
                if neighbor in visited or neighbor in avoid:
                    continue

                edge_time = self.get_edge_time(edge_data, weather, traffic_level)
                new_time = current_time + edge_time
                new_dist = best[current][1] + dist

                if neighbor not in best or new_time < best[neighbor][0]:
                    best[neighbor] = (new_time, new_dist, current)
                    heapq.heappush(pq, (new_time, neighbor))

        # Reconstruct path
        if destination not in best:
            return None

        path = []
        node = destination
        while node is not None:
            path.append(node)
            node = best[node][2]
        path.reverse()

        total_time, total_dist, _ = best[destination]

        waypoints = []
        for city in path:
            if city in CITIES:
                waypoints.append({
                    "city": city,
                    "lat": CITIES[city]["lat"],
                    "lng": CITIES[city]["lng"],
                })

        return {
            "path": path,
            "distance_km": round(total_dist),
            "estimated_hours": round(total_time, 1),
            "waypoints": waypoints,
        }

    def find_alternatives(
        self,
        source: str,
        destination: str,
        weather: str = "clear",
        traffic_level: int = 5,
        count: int = 2,
    ) -> list[dict]:
        """Find alternative routes by blocking intermediate cities."""
        best = self.dijkstra(source, destination, weather, traffic_level)
        if not best or len(best["path"]) < 3:
            return []

        alternatives = []
        intermediate = best["path"][1:-1]

        for block_city in intermediate:
            alt = self.dijkstra(
                source, destination, weather, traffic_level,
                avoid_cities=[block_city]
            )
            if alt and alt["path"] != best["path"]:
                alt["note"] = f"Avoiding {block_city}"
                # Avoid duplicates
                if not any(a["path"] == alt["path"] for a in alternatives):
                    alternatives.append(alt)
                if len(alternatives) >= count:
                    break

        return alternatives


# Singleton
city_graph = CityGraph()
