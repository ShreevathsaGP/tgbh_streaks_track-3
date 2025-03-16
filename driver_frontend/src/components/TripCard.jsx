import { FaMapMarkerAlt } from "react-icons/fa";

// Helper function to truncate the address string until the second comma
const truncateAddress = (address) => {
  const parts = address.split(",");
  return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : address; // Only show up to the second comma
};

const TripCard = ({ trip, onAcceptRide }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center mb-4">
      <div className="flex-1 max-w-[60%]">
        {" "}
        {/* Set the max-width to 60% */}
        <h3 className="font-semibold text-lg">
          {truncateAddress(trip.pickup)} → {truncateAddress(trip.drop)}
        </h3>
        <p className="text-gray-600 text-sm">Distance: {trip.distance} km</p>
      </div>
      <div className="flex items-center gap-2">
        <FaMapMarkerAlt className="text-green-500" />
        <p className="font-bold text-gray-800"> ₹{trip.fare}</p>
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
