import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  DirectionsService,
} from "@react-google-maps/api";
import { useState, useEffect, useMemo } from "react";

const API_KEY = "AIzaSyAnMQ1Kb2Bsm8FZk96U33_ATy8AFLFkdhU"; // Replace with your API key

const GoogleMapComponent = ({
  markerPosition,
  passengerLocation,
  homeLocation,
}) => {
  const containerStyle = useMemo(
    () => ({
      width: "50%", // Map width is set to 50%
      height: passengerLocation ? "670px" : "600px", // Dynamic height
      borderRadius: "12px", // Round corners
      position: "absolute", // Absolute position for control over placement
      left: "20px", // Align map container to the left side of the page
      top: "55%",
      transform: "translateY(-50%)", // Center vertically
    }),
    [passengerLocation]
  );

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [directionsError, setDirectionsError] = useState(null);

  // Effect to calculate and display route between markerPosition and passengerLocation
  useEffect(() => {
    if (markerPosition && passengerLocation) {
      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin: markerPosition,
          destination: passengerLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result);
          } else {
            setDirectionsError(status);
            console.error("Error fetching directions", status);
          }
        }
      );
    }
  }, [markerPosition, passengerLocation]); // Trigger effect when either position changes

  return (
    <LoadScript googleMapsApiKey={API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={14}
      >
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
        <Marker
          position={markerPosition}
          icon={{
            url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
            scaledSize: { width: 35, height: 35 },
          }}
        />
        {homeLocation &&
          (console.log(homeLocation),
          (
            <Marker
              position={homeLocation}
              // Display the home location marker
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Blue dot for the home location
              }}
            />
          ))}
        {passengerLocation && (
          <Marker
            position={passengerLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
