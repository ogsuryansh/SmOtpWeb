import json

with open('tg_prices.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# The structure is usually {"22": {"tg": {"cost": 15, "count": 350}}, ...}
# Let's map country IDs to names.
country_map = {"22": "India", "187": "USA", "16": "UK", "0": "Russia", "6": "Indonesia", "73": "Brazil", "*": "Any Country"}

print("=== TELEGRAM (tg) LIVE API PRICES ===")
for country_id, services in data.items():
    if "tg" in services:
        info = services["tg"]
        name = country_map.get(country_id, f"Country ID {country_id}")
        print(f"{name}: ₹{info['cost']} (Available: {info['count']})")
