import urllib.request
from bs4 import BeautifulSoup

try:
    req = urllib.request.Request('https://sastaotp.com/api', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    soup = BeautifulSoup(res, 'html.parser')
    print(soup.get_text()[:2000])
except Exception as e:
    print("Error:", e)
