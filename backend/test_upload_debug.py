import requests
import sys

def test_upload():
    url = "http://localhost:5000/api/shares"
    files = {'file': ('test.txt', b'Hello world content', 'text/plain')}
    data = {'text': 'Some text'}
    
    print(f"Uploading to {url}...")
    try:
        r = requests.post(url, files=files, data=data) 
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_upload()
