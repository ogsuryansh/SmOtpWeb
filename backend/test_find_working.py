import urllib.request
import json
import time

api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
base_url = 'https://sastaotp.com/stubs/handler_api.php?api_key=' + api_key

services = ['tg', 'wa', 'go', 'ig', 'fb']
countries = ['22', '187', '0', '1', '16', '73', '12', '9']

working = []

for srv in services:
    for c in countries:
        url = base_url + f"&action=getNumberV2&service={srv}&country={c}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
            
            # If it's not WRONG_MAX_PRICE or NO_NUMBERS, it might be a success!
            if 'WRONG_MAX_PRICE' not in res and 'NO_NUMBERS' not in res and 'OPERATION_NOT_AVAILABLE' not in res:
                print(f"SUCCESS/DIFFERENT ERROR on Service: {srv}, Country: {c} -> {res}")
                working.append((srv, c, res))
                
                # If we actually bought a number, we should cancel it!
                try:
                    data = json.loads(res)
                    if data.get('status') == 'OK' or data.get('activation_id'):
                        act_id = data.get('activation_id') or data.get('activation')
                        print(f"BOUGHT A NUMBER! ID: {act_id}. Cancelling now to save balance...")
                        cancel_url = base_url + f"&action=setStatus&status=8&id={act_id}"
                        urllib.request.urlopen(urllib.request.Request(cancel_url, headers={'User-Agent': 'Mozilla/5.0'}))
                        print("Cancelled.")
                except:
                    pass
            else:
                pass # print(f"Failed {srv} {c}")
        except Exception as e:
            print(f"Error {srv} {c}: {e}")
        time.sleep(0.5)

print("\n--- RESULTS ---")
for w in working:
    print(w)
if not working:
    print("Everything returned WRONG_MAX_PRICE or NO_NUMBERS.")
