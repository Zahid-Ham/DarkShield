import json
import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print("1. Testing Ingestion Health Endpoint...")
    res = httpx.get(f"{BASE_URL}/api/logs/health")
    print(f"Health status: {res.status_code} -> {res.json()}\n")

    print("2. Ingesting Sample CI/CD Security Events...")
    with open("samples/sample_cicd_event.json", "r", encoding="utf-8") as f:
        payload = json.load(f)

    res = httpx.post(f"{BASE_URL}/api/logs/ingest", json=payload)
    print(f"Ingest status: {res.status_code}")
    print(json.dumps(res.json(), indent=2))

    print("\n3. Fetching Recent Ingested Events...")
    res = httpx.get(f"{BASE_URL}/api/logs/recent?limit=10")
    print(f"Recent events status: {res.status_code}")
    print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    try:
        run_test()
    except Exception as err:
        print(f"Error executing test requests: {err}")
