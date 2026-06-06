import urllib.request
import json

url = 'https://sastaotp.com/stubs/handler_api.php?api_key=stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911&action=getServicesList&format=json'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})

try:
    with urllib.request.urlopen(req) as response:
        data = response.read().decode('utf-8')
        if not data:
            print("Empty response")
        elif data.startswith('{'):
            parsed = json.loads(data)
            print("Services List:")
            count = 0
            for k, v in parsed.get("services", {}).items():
                print(f"- {v.get('name', k)} ({k}): ₹{v.get('price', 'N/A')} (Qty: {v.get('available', 0)})")
                count += 1
            if count == 0:
                print("No services found in JSON.")
        else:
            print("Non-JSON Response:", data[:500])
except Exception as e:
    print("Error:", e)
