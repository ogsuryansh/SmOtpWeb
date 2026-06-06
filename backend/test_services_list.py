import urllib.request
api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
url = f'https://sastaotp.com/stubs/handler_api.php?api_key={api_key}&action=getServicesList&country=22&format=json'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    res = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
    print("Success, length:", len(res))
    print(res[:200])
except Exception as e:
    print(e)
