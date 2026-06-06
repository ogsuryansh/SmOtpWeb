import urllib.request

api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
base_url = 'https://sastaotp.com/stubs/handler_api.php?api_key=' + api_key

try:
    url = base_url + "&action=getPrices&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        res = response.read().decode('utf-8')
        with open('all_prices.json', 'w', encoding='utf-8') as f:
            f.write(res)
        print("all_prices length:", len(res))
except Exception as e:
    print(f"Error: {e}")
