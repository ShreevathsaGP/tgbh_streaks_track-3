import { useState } from "react";
import Home from "./pages/DriverHome";
import GoogleMapComponent from "./components/GoogleMap";

function App() {
  const [selectedTrip, setSelectedTrip] = useState(null);

  return (
    <div>
      <Home onAcceptRide={(trip) => setSelectedTrip(trip)} />
      {selectedTrip && (
        <GoogleMapComponent
          markerPosition={selectedTrip.pickupLocation}
          passengerLocation={selectedTrip.pickupLocation}
          homeLocation={selectedTrip.driverLocation}
        />
      )}
    </div>
  );
}

export default App;
