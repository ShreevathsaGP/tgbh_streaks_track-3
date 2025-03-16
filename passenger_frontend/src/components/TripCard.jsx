/* TripCard.js */
import { FaMapMarkerAlt } from "react-icons/fa";

const TripCard = ({ trip, onAcceptRide }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center mb-4">
      <div>
        <h3 className="font-semibold text-lg">
          {trip.pickup} → {trip.drop}
        </h3>
        <p className="text-gray-600 text-sm">Distance: {trip.distance} km</p>
      </div>
      <div className="flex items-center gap-2">
        <FaMapMarkerAlt className="text-green-500" />
        <p className="font-bold text-gray-800">{trip.fare}</p>
      </div>
      <button
        onClick={() => onAcceptRide(trip)} // Ensure this triggers the route update
        className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Accept Ride
      </button>
    </div>
  );
};

export default TripCard;
