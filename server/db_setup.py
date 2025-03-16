from pymongo import MongoClient
import random
from geopy.geocoders import Nominatim
import time

# 🔹 Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["great_hack"]

# 🔹 Collections
passenger_collection = db["passengers"]
driver_collection = db["drivers"]
ride_collection = db["rides"]

# 🔹 Clear all collections before inserting new schema
passenger_collection.delete_many({})
driver_collection.delete_many({})
ride_collection.delete_many({})

# 🔹 Helper function to get the location name from latitude and longitude
def get_location_name(lat, lon):
    geolocator = Nominatim(user_agent="GreatHackApp/1.0 (your_email@example.com)")
    try:
        location = geolocator.reverse((lat, lon), language='en', timeout=10)
        if location:
            return location.address
    except Exception as e:
        print(f"Error occurred while fetching location: {e}")
    return "Unknown Location"

# 🔹 Helper function to generate random locations in Bangalore
def random_location():
    lat = round(random.uniform(12.90, 13.00), 6)
    lon = round(random.uniform(77.55, 77.70), 6)
    location_name = get_location_name(lat, lon)
    return {
        "latitude": lat,
        "longitude": lon,
        "location_name": location_name
    }

# 🔹 Insert a sample passenger document
passenger_collection.insert_one({
    "_id": 1,
    "name": "Samarth",
    "current_location": {
        "latitude": 12.935426754420805, 
        "longitude": 77.53616944125176,
        "location_name": get_location_name(12.935426754420805, 77.53616944125176)
    },
    "streak_count": 2
})

passenger_collection.insert_one({
    "_id": 2,
    "name": "Mokshith",
    "current_location": {
        "latitude": 12.97165788310371, 
        "longitude": 77.53986561788038,
        "location_name": get_location_name(12.97165788310371, 77.53986561788038)
    },
    "streak_count": 9
})

# 🔹 Insert a sample driver document
driver_collection.insert_one({
    "_id": 1,
    "name": "Shashank",
    "current_location": {"latitude": 12.931650381643834, "longitude": 77.53387037892499},
    "streak_count": 49
})

driver_collection.insert_one({
    "_id": 2,
    "name": "Shreevathsa",
    "current_location": random_location(),
    "streak_count": 26
})

# 🔹 Helper function to generate rides near a specific driver
def generate_nearby_rides(driver_id, num_rides=3):
    driver = driver_collection.find_one({"_id": driver_id})
    if not driver:
        return []

    driver_location = driver["current_location"]
    rides = []
    
    # Generate random rides near the driver's location
    for _ in range(num_rides):
        ride = {
            "source": {
                "latitude": round(random.uniform(driver_location["latitude"] - 0.01, driver_location["latitude"] + 0.01), 6),
                "longitude": round(random.uniform(driver_location["longitude"] - 0.01, driver_location["longitude"] + 0.01), 6),
                "location_name": get_location_name(
                    round(random.uniform(driver_location["latitude"] - 0.01, driver_location["latitude"] + 0.01), 6),
                    round(random.uniform(driver_location["longitude"] - 0.01, driver_location["longitude"] + 0.01), 6)
                )
            },
            "destination": random_location(),
            "status": "pending",
            "price": None,
            "driver_id": driver_id,
            "passenger_id": random.choice([1, 2])  # Assign ride to random passenger
        }
        rides.append(ride)
    
    return rides

# # 🔹 Generate rides for Shashank (Driver 1)
# shashank_rides = generate_nearby_rides(1, num_rides=5)
# for ride in shashank_rides:
#     ride_collection.insert_one(ride)

# # 🔹 Generate rides for Shreevathsa (Driver 2)
# shreevathsa_rides = generate_nearby_rides(2, num_rides=5)
# for ride in shreevathsa_rides:
#     ride_collection.insert_one(ride)

print("Rides generated successfully!")
