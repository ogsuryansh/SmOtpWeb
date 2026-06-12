import urllib.request

api_key = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911'
base_url = 'https://sastaotp.com/stubs/handler_api.php?api_key=' + api_key

def test_param(param_name, values):
    for val in values:
        url = base_url + f"&action=getNumberV2&service=ig&country=22&{param_name}={val}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
            print(f"[{param_name}={val}] Response: {res}")
        except Exception as e:
            print(f"[{param_name}={val}] Error: {e}")

test_param("server", ["1", "2", "3", "server1"])
test_param("source", ["1", "2", "3"])
test_param("pool", ["1", "2", "3"])
