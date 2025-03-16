import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import GoogleMapComponent from "../components/GoogleMap";
import SearchBar from "../components/SearchBar";
import TripsList from "../components/TripsList";

// Helper function to truncate the address string until the second comma
const truncateAddress = (address) => {
  const parts = address.split(",");
  return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : address; // Only show up to the second comma
};

// Modified sendLocationToBackend function
const sendLocationToBackend = async (currentLocation, userId, destination) => {
  try {
    const response = await fetch("http://192.168.110.26:5000/request-ride", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passenger_id: userId,
        source: {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          location_name: currentLocation.location_name,
        }, // Current location
        destination: {
          latitude: destination.lat,
          longitude: destination.lng,
          location_name: destination.location_name,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send location data");
    }

    const data = await response.json();
    return data; // Assuming the backend returns { ride_id: 1, message: 'Ride requested' }
  } catch (error) {
    console.error("Error sending location:", error);
    return { message: "Error requesting ride" }; // Dummy response
  }
};

// New function to promote the ride to "pending"
const promoteRideToPending = async (rideId) => {
  try {
    const response = await fetch(
      `http://192.168.110.26:5000/promote-ride/${rideId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to promote ride");
    }

    const data = await response.json();
    return data; // Assuming backend returns success message
  } catch (error) {
    console.error("Error promoting ride:", error);
    return { message: "Error promoting ride" }; // Dummy response
  }
};

// Function to check ride status
const checkRideStatus = async (rideId) => {
  try {
    const response = await fetch(
      `http://192.168.110.26:5000/ride-status/${rideId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ride status");
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error("Error checking ride status:", error);
    return null; // If there is an error, return null
  }
};

const DriverHome = () => {
  const [markerPosition, setMarkerPosition] = useState({
    lat: 0,
    lng: 0,
  });
  const [homeLocation, setHomeLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [showHomeSearch, setShowHomeSearch] = useState(true);
  const [isHomeSet, setIsHomeSet] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0,
    lng: 0,
    location_name: "Fetching location...",
  });
  const [destination, setDestination] = useState(""); // State to hold the destination
  const [price, setPrice] = useState(null);
  const [isPriceFetched, setIsPriceFetched] = useState(false);
  const [showPassengerDetails, setShowPassengerDetails] = useState(false);
  const [progressWidth, setProgressWidth] = useState(24);
  const [rideId, setRideId] = useState(null); // Track the ride id
  const [driverInfo, setDriverInfo] = useState(null);
  const [passengerInfo, setPassengerInfo] = useState(null);

  const passenger_id = 1;

  // Fetch current location from backend when component mounts
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const response = await fetch(
          `http://192.168.110.26:5000/get-passenger/${passenger_id}`
        );
        const data = await response.json();

        if (data && data.current_location) {
          const { latitude, longitude, location_name } = data.current_location;
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            location_name: location_name,
          });
          setMarkerPosition({ lat: latitude, lng: longitude });
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        setCurrentLocation({
          lat: 0,
          lng: 0,
          location_name: "Failed to fetch location.",
        });
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch driver and passenger info when the ride is accepted
  const fetchDriverAndPassengerInfo = async (rideId) => {
    try {
      const rideResponse = await fetch(
        `http://192.168.110.26:5000/ride/${rideId}`
      );
      const rideData = await rideResponse.json();

      const driverResponse = await fetch(
        `http://192.168.110.26:5000/get-driver/${rideData.driver_id}`
      );
      const driverData = await driverResponse.json();
      setDriverInfo(driverData);

      const passengerResponse = await fetch(
        `http://192.168.110.26:5000/get-passenger/${rideData.passenger_id}`
      );
      const passengerData = await passengerResponse.json();
      setPassengerInfo(passengerData);
    } catch (error) {
      console.error("Error fetching driver or passenger info:", error);
    }
  };

  const handleSetHomeLocation = (location) => {
    setHomeLocation(location);
    setIsHomeSet(true);
  };

  const handleResetHome = () => {
    setHomeLocation(null);
    setIsHomeSet(false);
  };

  const handleOkayClick = async () => {
    // Check if the destination is not empty before making the API call
    if (!homeLocation.location_name) {
      alert("Please enter a destination.");
      return;
    }

    const response = await sendLocationToBackend(
      currentLocation,
      passenger_id,
      homeLocation
    );

    if (response.message === "Ride requested") {
      setRideId(response.ride_id); // Set the ride ID
      setIsPriceFetched(true); // Set state to show price after ride request
      setPrice(response.price); // Dummy price response, replace with actual API response
    }
  };

  const handleConfirmClick = async () => {
    if (rideId) {
      const response = await promoteRideToPending(rideId);
      if (response.message === "Ride status updated to 'pending'") {
        // Start checking the ride status
        const checkStatusInterval = setInterval(async () => {
          const status = await checkRideStatus(rideId);
          if (status === "accepted") {
            await fetchDriverAndPassengerInfo(rideId);
            setShowPassengerDetails(true); // Show passenger details once the ride is accepted
            clearInterval(checkStatusInterval); // Stop the interval once ride is accepted
          }
        }, 2000); // Check every 2 seconds
        setShowHomeSearch(false);
      } else {
        alert("Failed to promote the ride. Please try again.");
      }
    }
  };

  const handleCancelRide = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to cancel the ride?"
    );
    if (isConfirmed) {
      const decreaseProgress = (currentWidth) => {
        const nearestMultipleOf10 = Math.floor(currentWidth / 10) * 10;

        if (currentWidth > nearestMultipleOf10) {
          setProgressWidth(currentWidth - 1);
        }

        if (currentWidth > nearestMultipleOf10 + 1) {
          setTimeout(() => {
            decreaseProgress(currentWidth - 1);
          }, 100);
        } else {
          setTimeout(() => {
            setShowPassengerDetails(false);
            setShowHomeSearch(true);
            setPrice(null);
            setIsPriceFetched(false);
          }, 2000);
        }
      };

      decreaseProgress(progressWidth);
    }
  };

  return (
    <div className="min-h-screen bg-black-100 flex flex-col overflow-hidden">
      <Navbar
        setShowHomeSearch={() => setShowHomeSearch(true)}
        resetHome={handleResetHome}
        isHomeSet={isHomeSet}
      />

      <div className="flex w-full flex-1 overflow-hidden">
        <div className="w-1/2 h-full p-4">
          <GoogleMapComponent
            markerPosition={markerPosition}
            homeLocation={homeLocation}
            passengerLocation={passengerLocation}
            route={route}
          />
        </div>

        {/* Right Section with Search Bar and Price */}
        <div className="w-1/2 h-full p-4 ml-20 flex flex-col">
          {showHomeSearch && (
            <>
              {/* Current Location Placeholder */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 ml-10">
                  Current Location
                </label>
                <input
                  type="text"
                  className="w-3/4 p-3 rounded-lg border shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ease-in-out duration-200 text-lg font-medium ml-10"
                  placeholder={currentLocation.location_name}
                  disabled
                />
              </div>

              {/* Destination Search Bar with Label */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 ml-10">
                  Destination
                </label>
                <SearchBar
                  setHomeLocation={handleSetHomeLocation}
                  setShowHomeSearch={setShowHomeSearch}
                />
              </div>

              {/* OKAY Button */}
              {!isPriceFetched && (
                <div className="mb-4">
                  <button
                    onClick={handleOkayClick}
                    className="w-3/4 p-3 rounded-lg bg-indigo-500 text-white font-medium shadow-lg hover:bg-indigo-600 transition-all ease-in-out duration-200 ml-10"
                  >
                    OKAY
                  </button>
                </div>
              )}

              {/* Display Price and Confirm Button */}
              {isPriceFetched && (
                <>
                  <div className="mt-4">
                    <p className="text-lg font-semibold text-gray-700 ml-10">
                      Estimated Price: ₹{price}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleConfirmClick}
                      className="w-3/4 p-3 rounded-lg bg-green-500 text-white font-medium shadow-lg hover:bg-green-600 transition-all ease-in-out duration-200 ml-10"
                    >
                      CONFIRM
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Passenger Details Section */}
          {showPassengerDetails && (
            <div className="flex w-full h-full px-6 mt-4 flex-col rounded-xl bg-white shadow-lg">
              {/* First Section: Profile, Name, Streak, Rating */}
              <div className="w-full h-3/4 rounded-xl border border-gray-300 flex flex-col overflow-hidden mt-7">
                <div className="w-full h-1/3 flex border-b border-gray-200">
                  <div className="w-3/10 h-full flex justify-center items-center p-4">
                    <img
                      src={
                        driverInfo?.profile_picture ||
                        "https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg"
                      }
                      alt="Profile"
                      className="w-38 h-38 rounded-full object-cover shadow-md"
                    />
                  </div>

                  <div className="w-7/10 h-full flex flex-col p-4">
                    <div className="w-full h-2/3 flex items-center text-left justify-center">
                      <span className="text-5xl font-bold text-gray-800 font-sans">
                        {driverInfo?.name || "Passenger Name"}
                      </span>
                    </div>

                    <div className="w-full h-1/3 flex justify-center items-center mt-10">
                      <span className="text-l text-yellow-500 mr-50 font-semibold font-sans">
                        Rating: {driverInfo?.rating || "4.1"}
                      </span>
                      <span className="text-l text-gray-600 font-semibold font-sans">
                        Streak: {driverInfo?.streak_count || 0} days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-1/3 flex border-b border-gray-200">
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-2xl text-gray-700">
                      DROP: {truncateAddress(homeLocation.location_name)}
                    </span>
                  </div>
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-2xl text-gray-700">
                      PICKUP: {truncateAddress(currentLocation.location_name)}
                    </span>
                  </div>
                </div>

                <div className="w-full h-1/3 flex">
                  <div className="w-1/2 h-full flex justify-center items-center p-4 border-r border-gray-200">
                    <span className="font-semibold text-gray-800 text-2xl">
                      Fare: ₹{price}
                    </span>
                  </div>
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-2xl font-semibold text-gray-800">
                      ETA: 15 min
                    </span>
                  </div>
                </div>
              </div>

              {/* CANCEL button */}
              <div className="w-full h-12 flex justify-center items-center py-2">
                <button
                  onClick={handleCancelRide}
                  className="w-3/3 bg-gradient-to-r from-red-500 to-red-700 text-white font-medium px-6 py-2 rounded-full shadow-lg transform transition duration-200 hover:scale-101 hover:bg-red-600 focus:outline-none mt-10"
                >
                  CANCEL
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1/6 flex flex-col justify-center items-center py-6">
                <div className="w-full bg-gray-200 h-8 rounded-full overflow-hidden relative items-center flex">
                  {[2, 4, 6, 8].map((num, index) => (
                    <span
                      key={index}
                      className="absolute transform -translate-x-1/2 text-sm font-semibold text-white"
                      style={{ left: `${(index + 1) * 20}%` }}
                    >
                      {num}
                    </span>
                  ))}
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700"
                    style={{ width: `${(progressWidth / 50) * 100}%` }}
                  ></div>
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-2xl text-white font-bold">
                    🏆
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverHome;
