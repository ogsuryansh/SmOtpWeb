import urllib.request
import json

api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
base_url = 'https://sastaotp.com/stubs/handler_api.php?api_key=' + api_key

try:
    url = base_url + "&action=getOperators&country=22"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
    print("Response:", res)
except Exception as e:
    print("Error:", e)
