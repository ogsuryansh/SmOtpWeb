import urllib.request
import json

api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
base_url = 'https://sastaotp.com/stubs/handler_api.php?api_key=' + api_key

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        return f"Error: {e}"

# Test getPrices for telegram
print("Fetching TG Prices...")
res = fetch_json(base_url + "&action=getPrices&service=tg&format=json")
with open('tg_prices.json', 'w', encoding='utf-8') as f:
    f.write(res)
print("TG Prices length:", len(res))

# Test getPrices for WA
print("Fetching WA Prices...")
res2 = fetch_json(base_url + "&action=getPrices&service=wa&format=json")
with open('wa_prices.json', 'w', encoding='utf-8') as f:
    f.write(res2)
print("WA Prices length:", len(res2))
