import requests
import time

def test():
    API_URL = "http://127.0.0.1:8000"
    print("Testing health...")
    res = requests.get(f"{API_URL}/agent/health")
    print(res.status_code, res.json())

    print("\nTesting protect-delay...")
    res = requests.post(f"{API_URL}/agent/predict-delay", json={"Distance_km": 400, "Weather": "rainy", "Traffic_Level": 7})
    print(res.status_code, res.json())

    print("\nTesting optimize-route...")
    res = requests.post(f"{API_URL}/agent/optimize-route", json={"source": "Mumbai", "destination": "Delhi"})
    print(res.status_code, res.json())

    print("\nTesting chat...")
    res = requests.post(f"{API_URL}/agent/chat", json={"message": "Why is LD-4823 delayed?"})
    print(res.status_code, res.json())

if __name__ == "__main__":
    test()
