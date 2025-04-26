import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print("Health Check Response:", response.status_code)
    print(json.dumps(response.json(), indent=2))
    print()

def test_query():
    """Test the query endpoint with a simple query"""
    query_data = {
        "query": "RETURN 1 as test"
    }
    response = requests.post(f"{BASE_URL}/query", json=query_data)
    print("Query Response:", response.status_code)
    print(json.dumps(response.json(), indent=2))
    print()

def test_trigger_sync():
    """Test the trigger-sync endpoint"""
    response = requests.get(f"{BASE_URL}/trigger-sync")
    print("Trigger Sync Response:", response.status_code)
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == "__main__":
    print("Testing Kuzu API...")
    print("===================")
    
    try:
        test_health()
        test_query()
        test_trigger_sync()
        print("All tests completed!")
    except Exception as e:
        print(f"Error during testing: {str(e)}")
