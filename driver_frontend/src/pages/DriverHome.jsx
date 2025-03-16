import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import GoogleMapComponent from "../components/GoogleMap";
import SearchBar from "../components/SearchBar";
import TripsList from "../components/TripsList";

const IP_ADDRESS = "192.168.110.26";

const DriverHome = () => {
  const driver_id = 2; // Hardcoded driver ID, can be replaced with dynamic value if needed

  const [markerPosition, setMarkerPosition] = useState({
    lat: 12.9716,
    lng: 77.5946,
  });

  const [homeLocation, setHomeLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [showHomeSearch, setShowHomeSearch] = useState(false);
  const [isHomeSet, setIsHomeSet] = useState(false);
  const [suggestedRides, setSuggestedRides] = useState([]);

  const [progressWidth, setProgressWidth] = useState(45);

  // Store passenger and driver details after accepting a ride
  const [passengerInfo, setPassengerInfo] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);

  // Store the accepted ride info
  const [acceptedRide, setAcceptedRide] = useState(null);

  const truncateAddress = (address) => {
    const parts = address.split(",");
    return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : address;
  };

  // Fetch suggested rides when the component mounts
  useEffect(() => {
    const fetchSuggestedRides = async () => {
      try {
        const response = await fetch(
          `http://${IP_ADDRESS}:5000/suggest-rides/${driver_id}`,
          {
            method: "GET",
          }
        );

        const data = await response.json();
        if (data.suggested_rides) {
          const formattedRides = data.suggested_rides.map((ride) => {
            console.log(ride);

            return {
              ride_id: ride._id,
              driver_id: ride.driver_id,
              passenger_id: ride.passenger_id,
              pickup: ride.source.location_name,
              drop: ride.destination.location_name,
              distance: calculateDistance(
                ride.source.latitude,
                ride.source.longitude,
                ride.destination.latitude,
                ride.destination.longitude
              ),
              fare: ride.price, // You can replace this with a dynamic fare calculation
              location: {
                lat: ride.source.latitude,
                lng: ride.source.longitude,
              },
            };
          });
          setSuggestedRides(formattedRides);
          console.log(formattedRides);
        }
      } catch (error) {
        console.error("Error fetching suggested rides:", error);
      }
    };

    fetchSuggestedRides();
  }, [driver_id]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Using Haversine formula to calculate the distance between two lat/lng points
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(2); // Returns distance in km with 2 decimals
  };

  const handleSetHomeLocation = (location) => {
    setHomeLocation(location);
    setIsHomeSet(true);
    setShowHomeSearch(false);
    console.log("this has happened");
    console.log(location);
  };

  const handleResetHome = () => {
    setHomeLocation(null);
    setIsHomeSet(false);
  };

  const handleAcceptRide = (trip) => {
    setPassengerLocation(trip.location);
    setSuggestedRides([]); // Clear the suggested rides when a ride is accepted
    setRoute({ origin: markerPosition, destination: trip.location });

    fetch(`http://${IP_ADDRESS}:5000/accept-ride/${trip.ride_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driver_id, // Pass the driver ID
      }),
    });

    // Fetch the passenger and driver details
    fetch(`http://${IP_ADDRESS}:5000/get-passenger/${trip.passenger_id}`)
      .then((response) => response.json())
      .then((data) => {
        setPassengerInfo(data); // Store passenger info in state
        console.log("Passenger Info:", data);
      })
      .catch((error) => console.error("Error fetching passenger info:", error));

    fetch(`http://${IP_ADDRESS}:5000/get-driver/${trip.driver_id}`)
      .then((response) => response.json())
      .then((data) => {
        setDriverInfo(data); // Store driver info in state
        console.log("Driver Info:", data);
      })
      .catch((error) => console.error("Error fetching driver info:", error));

    // Store the accepted ride information
    setAcceptedRide(trip);
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
            setPassengerLocation(null);
            setRoute(null);
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
        {/* Left Section: Search and Trip List */}
        <div className="w-1/2 p-6 flex flex-col">
          {showHomeSearch && (
            <SearchBar
              setHomeLocation={handleSetHomeLocation}
              setShowHomeSearch={setShowHomeSearch}
            />
          )}

          {!passengerLocation && suggestedRides.length > 0 && (
            <TripsList trips={suggestedRides} onAcceptRide={handleAcceptRide} />
          )}

          {passengerLocation && (
            <div className="flex w-full h-full px-6 mt-4 flex-col rounded-xl bg-white shadow-lg">
              {/* First Section: 75% height with rounded corners and minimalistic design */}
              <div className="w-full h-3/4 rounded-xl border border-gray-300 flex flex-col overflow-hidden mt-7">
                {/* First Row (Profile, Name, Streak, Rating) */}
                <div className="w-full h-1/3 flex border-b border-gray-200">
                  {/* Left Column: Profile picture with placeholder */}
                  <div className="w-3/10 h-full flex justify-center items-center p-4">
                    <img
                      src={
                        passengerInfo?.profile_picture ||
                        "https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg"
                      }
                      alt="Profile"
                      className="w-38 h-38 rounded-full object-cover shadow-md"
                    />
                  </div>

                  {/* Right Column: Name, Current Streak, Rating */}
                  <div className="w-7/10 h-full flex flex-col p-4">
                    {/* Row 1: Name */}
                    <div className="w-full h-2/3 flex items-center text-left justify-center">
                      <span className="text-5xl font-bold text-gray-800 font-sans">
                        {passengerInfo?.name || "Driver Name"}
                      </span>
                    </div>

                    {/* Row 2: Rating and Streak */}
                    <div className="w-full h-1/3 flex justify-center items-center">
                      <span className="text-l text-yellow-500 mr-50 font-semibold font-sans">
                        Rating: {passengerInfo?.rating || "4.1"}
                      </span>
                      <span className="text-l text-gray-600 font-semibold font-sans">
                        Streak: {passengerInfo?.streak_count || 0} days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-1/3 flex border-b border-gray-200">
                  {/* Left Column: Drop-off location */}
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-xl text-gray-700">
                      DROP: {truncateAddress(acceptedRide?.drop)}
                    </span>
                  </div>

                  {/* Right Column: Pickup location */}
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-xl text-gray-700">
                      PICKUP: {truncateAddress(acceptedRide?.pickup)}
                    </span>
                  </div>
                </div>

                {/* Third Row: Fare and ETA */}
                <div className="w-full h-1/3 flex">
                  {/* Left Column: Fare */}
                  <div className="w-1/2 h-full flex justify-center items-center p-4 border-r border-gray-200">
                    <span className="font-semibold text-gray-800 text-2xl">
                      Fare: ₹{acceptedRide.fare}
                    </span>
                  </div>

                  {/* Right Column: ETA */}
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-2xl font-semibold text-gray-800">
                      ETA: 15 min
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Section: 10% height for the CANCEL button */}
              <div className="w-full h-12 flex justify-center items-center py-2">
                <button
                  onClick={handleCancelRide}
                  className="w-3/3 bg-gradient-to-r from-red-500 to-red-700 text-white font-medium px-6 py-2 rounded-full shadow-lg transform transition duration-200 hover:scale-101 hover:bg-red-600 focus:outline-none mt-10"
                >
                  CANCEL
                </button>
              </div>

              {/* Third Section: 15% height for the progress bar */}
              <div className="w-full h-1/6 flex flex-col justify-center items-center py-6">
                <div className="w-full bg-gray-200 h-8 rounded-full overflow-hidden relative  items-center flex">
                  {[10, 20, 30, 40].map((num, index) => (
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
                  ></div>{" "}
                  {/* Progress bar */}
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-2xl text-white font-bold">
                    🏆
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Google Map */}
        <div className="w-1/2 h-full p-4">
          <GoogleMapComponent
            markerPosition={markerPosition}
            homeLocation={homeLocation}
            passengerLocation={passengerLocation}
            route={route}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverHome;
