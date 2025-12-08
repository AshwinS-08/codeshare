import urllib.request
import urllib.parse
import json
import time
import sys

base_url = "http://localhost:5001"
time.sleep(2)

try:
    print("Creating share...")
    data = json.dumps({"text": "TestContent"}).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/api/shares", data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        print(f"Create Status: {resp.status}")
        resp_body = resp.read().decode('utf-8')
        print(f"Create Body: {resp_body}")
        
        data_json = json.loads(resp_body)
        code = data_json.get("code")
        print(f"Share Code: {code}")
        
        print("Getting share...")
        req2 = urllib.request.Request(f"{base_url}/api/shares/{code}")
        try:
            with urllib.request.urlopen(req2) as resp2:
                print(f"Get Status: {resp2.status}")
                print(f"Get Body: {resp2.read().decode('utf-8')}")
        except urllib.error.HTTPError as e:
            print(f"Get Status: {e.code}")
            print(f"Get Body: {e.read().decode('utf-8')}")

except Exception as e:
    print(f"Error: {e}")
