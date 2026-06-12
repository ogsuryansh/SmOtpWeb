import urllib.request
import json

api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
base_url = 'https://sastaotp.com/stubs/handler_api.php?api_key=' + api_key

try:
    url = base_url + "&action=getCountries&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
    data = json.loads(res)
    
    print("Keys in getCountries response:", list(data.keys()))
    
    # Check what the actual country codes look like for India
    for cid, cinfo in data.get("countries", data).items():
        if isinstance(cinfo, dict):
            if cinfo.get("eng", "").lower() == "india" or cinfo.get("name", "").lower() == "india":
                print("India data:", cid, cinfo)
            if cid in ["22", "india", "in"]:
                print("ID", cid, "data:", cinfo)
except Exception as e:
    print("Error:", e)
