import urllib.request
import json
import time

api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
base_url = 'https://sastaotp.com/stubs/handler_api.php?api_key=' + api_key

services = {
    'tg': 'Telegram',
    'wa': 'WhatsApp',
    'go': 'Google',
    'ig': 'Instagram',
    'fb': 'Facebook',
    'tw': 'Twitter/X',
    'nf': 'Netflix',
    'az': 'Amazon'
}

print("=== LIVE SASTAOTP PRICE LIST (INDIAN PRICES) ===")
print("Note: These are base API prices before your website's markup.\n")

for code, name in services.items():
    try:
        url = base_url + f"&action=getPrices&service={code}&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            res = response.read().decode('utf-8')
            data = json.loads(res)
            
            # Country 22 is India
            if "data" in data and "22" in data["data"] and code in data["data"]["22"]:
                info = data["data"]["22"][code]
                print(f"OK - {name} ({code}): INR {info['cost']} (Qty: {info['count']})")
            else:
                # Fallback to any country (*)
                if "data" in data and "*" in data["data"] and code in data["data"]["*"]:
                    info = data["data"]["*"][code]
                    print(f"OK - {name} ({code}): INR {info['cost']} (Global Price, Qty: {info['count']})")
                else:
                    print(f"FAIL - {name} ({code}): No data for India or Global")
    except Exception as e:
        print(f"FAIL - {name} ({code}): Error fetching ({e})")
    time.sleep(0.5)

