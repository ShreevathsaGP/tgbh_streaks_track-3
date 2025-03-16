import TripCard from "./TripCard";

const TripsList = ({ trips, onAcceptRide }) => {
  return (
    <div className="w-9/10 p-6 bg-white shadow-lg rounded-xl box-border mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
        Available Trips
      </h2>
      {trips.length > 0 ? (
        <div className="space-y-3">
          {trips.map((trip, index) => (
            <TripCard
              key={index}
              trip={trip}
              onAcceptRide={() => onAcceptRide(trip)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No trips available.</p>
      )}
    </div>
  );
};

export default TripsList;
