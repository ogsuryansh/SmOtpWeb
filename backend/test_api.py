import urllib.request
import json

api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
base_url = 'https://sastaotp.com/stubs/handler_api.php?api_key=' + api_key

endpoints = [
    "&action=getBalance",
    "&action=getCountries&format=json",
    "&action=getServicesList&service=tg&format=json"
]

def fetch(url_suffix):
    url = base_url + url_suffix
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = response.read().decode('utf-8')
            return f"Success ({len(data)} chars): " + data[:200]
    except Exception as e:
        return f"Error: {e}"

for ep in endpoints:
    print(f"Testing {ep} ...")
    print("Result:", fetch(ep))
    print("-" * 40)
