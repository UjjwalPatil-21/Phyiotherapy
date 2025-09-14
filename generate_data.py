import json
import random

# --- Data Pools ---

first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Anaya", "Diya", "Saanvi", "Kiara", "Giana", "Ira", "Siya", "Myra", "Aadhya", "Riya"]
last_names = ["Patel", "Shah", "Mehta", "Reddy", "Kumar", "Gupta", "Khan", "Desai", "Joshi", "Kapoor", "Verma", "Sharma", "Singh", "Malhotra", "Naidu", "Chopra"]
hospitals = ["Lilavati Hospital", "Breach Candy Hospital", "Fortis Hospital", "Kokilaben Hospital", "Jaslok Hospital", "Hiranandani Hospital", "Saifee Hospital", None, None, None, None, None]
specialties = ["Orthopedic", "Neurological", "Cardiopulmonary", "Pediatric", "Geriatric", "Sports Injury", "Women's Health"]
street_suffixes = ["Road", "Street", "Lane", "Marg", "Nagar", "Circle"]

# Bounding boxes for different areas in Mumbai
mumbai_areas = {
    "South Mumbai": {"lat_range": (18.90, 18.96), "lng_range": (72.81, 72.84), "streets": ["Colaba", "Fort", "Marine Lines", "Malabar Hill"]},
    "Dadar": {"lat_range": (19.01, 19.04), "lng_range": (72.83, 72.86), "streets": ["Dadar West", "Dadar East", "Shivaji Park"]},
    "Bandra": {"lat_range": (19.04, 19.07), "lng_range": (72.82, 72.85), "streets": ["Bandra West", "Bandra East", "Pali Hill"]},
    "Andheri": {"lat_range": (19.10, 19.13), "lng_range": (72.83, 72.86), "streets": ["Andheri West", "Andheri East", "Lokhandwala"]},
    "Juhu": {"lat_range": (19.08, 19.11), "lng_range": (72.82, 72.84), "streets": ["Juhu Tara Road", "Vile Parle West"]},
    "Powai": {"lat_range": (19.11, 19.14), "lng_range": (72.89, 72.92), "streets": ["Hiranandani Gardens", "IIT Bombay Area"]},
    "Thane": {"lat_range": (19.18, 19.22), "lng_range": (72.95, 72.98), "streets": ["Thane West", "Ghodbunder Road"]},
    "Borivali": {"lat_range": (19.22, 19.25), "lng_range": (72.84, 72.87), "streets": ["Borivali West", "Borivali East"]},
}

# --- Data Generation ---

def generate_physiotherapists(count=550):
    physios = []
    for _ in range(count):
        first = random.choice(first_names)
        last = random.choice(last_names)

        area_name, area_data = random.choice(list(mumbai_areas.items()))
        lat = random.uniform(*area_data["lat_range"])
        lng = random.uniform(*area_data["lng_range"])

        street_name = random.choice(area_data["streets"])
        street_suffix = random.choice(street_suffixes)

        address = f"{random.randint(100, 999)}, {street_name}, {area_name}, Mumbai"

        physio = {
            "name": f"Dr. {first} {last}",
            "location": {
                "lat": round(lat, 4),
                "lng": round(lng, 4)
            },
            "address": address,
            "contact": f"9{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "rating": round(random.uniform(3.8, 5.0), 1),
            "specialties": random.sample(specialties, k=random.randint(1, 3)),
            "hospital": random.choice(hospitals)
        }
        physios.append(physio)

    return physios

# --- Main Execution ---

if __name__ == "__main__":
    new_physio_data = generate_physiotherapists()

    try:
        with open('physiotherapists.json', 'w') as f:
            json.dump(new_physio_data, f, indent=2)
        print(f"Successfully generated and saved {len(new_physio_data)} physiotherapist entries to physiotherapists.json")
    except Exception as e:
        print(f"An error occurred while writing to the file: {e}")
