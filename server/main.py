from flask import Flask, request, jsonify
from pymongo import MongoClient
import random
from geopy.distance import geodesic
from flask_cors import CORS  # Import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins="*", supports_credentials=True)


# 🔹 Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["great_hack"]

passenger_collection = db["passengers"]
driver_collection = db["drivers"]
ride_collection = db["rides"]

# 🔹 Function to calculate distance between two lat/lng points
def calculate_distance(loc1, loc2):
    """
    Calculate the geodesic distance between two locations.

    Parameters:
    loc1 (dict): {latitude: float, longitude: float} for the first location.
    loc2 (dict): {latitude: float, longitude: float} for the second location.

    Returns:
    float: Distance in kilometers.
    """
    return geodesic((loc1["latitude"], loc1["longitude"]), (loc2["latitude"], loc2["longitude"])).km

# 🔹 Helper function to generate random locations in Bangalore
def random_location():
    return {
        "latitude": round(random.uniform(12.90, 13.00), 6),
        "longitude": round(random.uniform(77.55, 77.70), 6)
    }

# Fetch the details of a specific passenger by their ID
@app.route("/get-passenger/<int:passenger_id>", methods=["GET"])
def get_passenger(passenger_id):
    passenger = passenger_collection.find_one({"_id": passenger_id})
    if not passenger:
        return jsonify({"error": "Passenger not found"}), 404
    return jsonify(passenger)

# Fetch the details of a specific driver by their ID
@app.route("/get-driver/<int:driver_id>", methods=["GET"])
def get_driver(driver_id):
    driver = driver_collection.find_one({"_id": driver_id})
    if not driver:
        return jsonify({"error": "Driver not found"}), 404
    return jsonify(driver)

# 🔹 Request a ride (Passenger creates a ride request)
@app.route("/request-ride", methods=["POST"])
def request_ride():
    data = request.json
    ride_id = ride_collection.count_documents({}) + 1

    # dummy values for the sake of the demo
    dummy_price = 100
    if data["destination"]["location_name"].lower().find("ring") != -1:
        dummy_price = 203
    else:
        dummy_price = 172

    ride = {
        "_id": ride_id,
        "source": data.get("source", random_location()),
        "destination": data["destination"],
        "status": "requesting",
        "price": dummy_price,
        "driver_id": None,
        "passenger_id": data["passenger_id"]
    }
    ride_collection.insert_one(ride)

    
    return jsonify({"message": "Ride requested", "ride_id": ride_id, "price": dummy_price})

# Promote a ride from "requesting" to "pending"
@app.route("/promote-ride/<int:ride_id>", methods=["POST"])
def promote_ride(ride_id):
    ride = ride_collection.find_one({"_id": ride_id})
    if not ride:
        return jsonify({"error": "Ride not found"}), 404

    # Check if the ride is currently in the "requesting" stage
    if ride["status"] != "requesting":
        return jsonify({"error": "Ride is not in 'requesting' status"}), 400

    # Update the status to "pending"
    ride_collection.update_one(
        {"_id": ride_id}, {"$set": {"status": "pending"}}
    )

    return jsonify({"message": "Ride status updated to 'pending'", "ride_id": ride_id})


# 🔹 Accept a ride (Driver accepts a ride request)
@app.route("/accept-ride/<int:ride_id>", methods=["POST"])
def accept_ride(ride_id):
    data = request.json
    ride = ride_collection.find_one({"_id": ride_id})
    if not ride or ride["status"] != "pending":
        return jsonify({"error": "Ride not found or already accepted"}), 400
    
    # price = random.randint(100, 500)  # Random price assigned
    ride_collection.update_one({"_id": ride_id}, {"$set": {"status": "accepted", "driver_id": data["driver_id"]}})
    return jsonify({"message": "Ride accepted", "ride_id": ride_id})

@app.route("/driver-streak/<int:driver_id>", methods=["GET"])
def get_driver_streak(driver_id):
    print(driver_id)
    driver = driver_collection.find_one({"_id": driver_id}, {"streak_count": 1, "_id": 0})
    if not driver:
        return jsonify({"error": "Driver not found"}), 404
    return jsonify(driver)

@app.route("/modify-driver-streak/<int:driver_id>", methods=["POST"])
def modify_driver_streak(driver_id):
    data = request.json
    driver_collection.update_one({"_id": driver_id}, {"$set": {"streak_count": data["streak_count"]}})
    return jsonify({"message": "Driver streak updated"})

@app.route("/passenger-streak/<int:passenger_id>", methods=["GET"])
def get_passenger_streak(passenger_id):
    passenger = passenger_collection.find_one({"_id": passenger_id}, {"streak_count": 1, "_id": 0})
    if not passenger:
        return jsonify({"error": "Passenger not found"}), 404
    return jsonify(passenger)

@app.route("/modify-passenger-streak/<int:passenger_id>", methods=["POST"])
def modify_passenger_streak(passenger_id):
    data = request.json
    passenger_collection.update_one({"_id": passenger_id}, {"$set": {"streak_count": data["streak_count"]}})
    return jsonify({"message": "Passenger streak updated"})

# NEED TO IMPLEMENT
@app.route("/take-me-home/<int:passenger_id>", methods=["POST"])
def take_me_home(passenger_id):
    return jsonify({"message": "Feature not implemented yet"})
# NEED TO IMPLEMENT

def serialize_ride(ride):
    ride["_id"] = str(ride["_id"])  # Convert ObjectId to string
    return ride

# 🔹 Suggest rides (Driver id provided, suggest closest ride within 3 km)
# Suggest rides (Driver id provided, suggest closest ride within 3 km)
@app.route("/suggest-rides/<int:driver_id>", methods=["GET"])
def suggest_rides(driver_id):
    driver = driver_collection.find_one({"_id": driver_id}, {"current_location": 1, "_id": 0})
    
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    driver_location = driver["current_location"]
    
    # Step 1: Get all rides with 'pending' status
    all_pending_rides = ride_collection.find({"status": "pending"})

    suggested_rides = []
    
    # Step 2: Check if each pending ride is within 3 km of the driver
    for ride in all_pending_rides:
        ride_location = ride["source"]
        print(driver_location)
        print(ride_location)
        distance = calculate_distance(driver_location, ride_location)
        
        if distance <= 3:  # If the ride is within 3 km
            suggested_rides.append(serialize_ride(ride))  # Serialize the ride before adding it to the list

    return jsonify({"suggested_rides": suggested_rides})

# 🔹 Get the full ride object by its ride ID
@app.route("/ride/<int:ride_id>", methods=["GET"])
def get_ride(ride_id):
    # Fetch the ride details from the database
    ride = ride_collection.find_one({"_id": ride_id})

    if not ride:
        return jsonify({"error": "Ride not found"}), 404

    # Return the full ride object
    ride["_id"] = str(ride["_id"])  # Convert ObjectId to string for JSON serialization
    return jsonify(ride)

# 🔹 Get the status of a ride by its ride ID
@app.route("/ride-status/<int:ride_id>", methods=["GET"])
def get_ride_status(ride_id):
    # Fetch the ride details from the database
    ride = ride_collection.find_one({"_id": ride_id})

    if not ride:
        return jsonify({"error": "Ride not found"}), 404

    # Return the ride status
    return jsonify({"ride_id": ride_id, "status": ride["status"]})

if __name__ == "__main__":
    # app.run(debug=True)
    app.run(debug=True, host="0.0.0.0", port=5000)
