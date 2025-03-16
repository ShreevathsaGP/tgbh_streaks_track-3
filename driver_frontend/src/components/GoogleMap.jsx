// import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
// import { useState, useEffect, useMemo } from "react";

// const API_KEY = "AIzaSyAnMQ1Kb2Bsm8FZk96U33_ATy8AFLFkdhU"; // Replace with your API key

// const GoogleMapComponent = ({ markerPosition, passengerLocation }) => {
//   const containerStyle = useMemo(() => ({
//     width: "50%",
//     height: passengerLocation ? "670px" : "600px",
//     borderRadius: "12px",
//     position: "absolute",
//     right: "20px",
//     top: "55%",
//     transform: "translateY(-50%)",
//   }), [passengerLocation]);

//   const [directions, setDirections] = useState(null);

//   // Effect to calculate and display route between markerPosition and passengerLocation
//   useEffect(() => {
//     if (markerPosition && passengerLocation) {
//       const directionsService = new google.maps.DirectionsService();
//       directionsService.route(
//         {
//           origin: markerPosition,
//           destination: passengerLocation,
//           travelMode: google.maps.TravelMode.DRIVING,
//         },
//         (result, status) => {
//           if (status === google.maps.DirectionsStatus.OK) {
//             setDirections(result);
//           } else {
//             console.error("Error fetching directions", status);
//           }
//         }
//       );
//     }
//   }, [markerPosition, passengerLocation]); // Trigger effect when either position changes

//   return (
//     <LoadScript googleMapsApiKey={API_KEY}>
//       <GoogleMap mapContainerStyle={containerStyle} center={markerPosition} zoom={14}>
//         {directions && <DirectionsRenderer directions={directions} />}
//         <Marker position={markerPosition} icon={{ url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png", scaledSize: { width: 35, height: 35 } }} />
//         {passengerLocation && <Marker position={passengerLocation} icon={{ url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png" }} />}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default GoogleMapComponent;

// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   DirectionsRenderer,
//   DirectionsService,
// } from "@react-google-maps/api";
// import { useState, useEffect, useMemo } from "react";

// const API_KEY = "AIzaSyAnMQ1Kb2Bsm8FZk96U33_ATy8AFLFkdhU"; // Replace with your API key

// const GoogleMapComponent = ({ markerPosition, passengerLocation }) => {
//   const containerStyle = useMemo(
//     () => ({
//       width: "50%",
//       height: passengerLocation ? "670px" : "600px",
//       borderRadius: "12px",
//       position: "absolute",
//       right: "20px",
//       top: "55%",
//       transform: "translateY(-50%)",
//     }),
//     [passengerLocation]
//   );

//   const [directionsResponse, setDirectionsResponse] = useState(null);
//   const [directionsError, setDirectionsError] = useState(null);

//   // Effect to calculate and display route between markerPosition and passengerLocation
//   useEffect(() => {
//     if (markerPosition && passengerLocation) {
//       const directionsService = new google.maps.DirectionsService();

//       directionsService.route(
//         {
//           origin: markerPosition,
//           destination: passengerLocation,
//           travelMode: google.maps.TravelMode.DRIVING,
//         },
//         (result, status) => {
//           if (status === google.maps.DirectionsStatus.OK) {
//             setDirectionsResponse(result);
//           } else {
//             setDirectionsError(status);
//             console.error("Error fetching directions", status);
//           }
//         }
//       );
//     }
//   }, [markerPosition, passengerLocation]); // Trigger effect when either position changes

//   return (
//     <LoadScript googleMapsApiKey={API_KEY}>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={markerPosition}
//         zoom={14}
//       >
//         {directionsResponse && (
//           <DirectionsRenderer directions={directionsResponse} />
//         )}
//         <Marker
//           position={markerPosition}
//           icon={{
//             url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
//             scaledSize: { width: 35, height: 35 },
//           }}
//         />
//         {passengerLocation && (
//           <Marker
//             position={passengerLocation}
//             icon={{
//               url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
//             }}
//           />
//         )}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default GoogleMapComponent;

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
      width: "50%",
      height: passengerLocation ? "670px" : "600px",
      borderRadius: "12px",
      position: "absolute",
      right: "20px",
      top: "55%",
      transform: "translateY(-50%)",
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

  useEffect(() => {
    console.log("helooooo");
    console.log(homeLocation);
  }, [homeLocation]);

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
        {homeLocation && (
          <Marker
            position={homeLocation}
            icon={{
              url: "/house.png",
              scaledSize: { width: 35, height: 35 },
            }}
          />
        )}
        {homeLocation && (
          <Marker
            position={{
              lat: (homeLocation.lat + markerPosition.lat) / 2 + 0.02,
              lng: (homeLocation.lng + markerPosition.lng) / 2 + 0.01,
            }}
            icon={{
              url: "/house.png",
              scaledSize: { width: 20, height: 20 },
            }}
          />
        )}
        {homeLocation && (
          <Marker
            position={{
              lat: (homeLocation.lat + markerPosition.lat) / 2 + 0.005,
              lng: (homeLocation.lng + markerPosition.lng) / 2 + 0.01,
            }}
            icon={{
              url: "/house.png",
              scaledSize: { width: 20, height: 20 },
            }}
          />
        )}
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
