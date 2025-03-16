import { useState } from "react";

const API_KEY = "AIzaSyAnMQ1Kb2Bsm8FZk96U33_ATy8AFLFkdhU";
const autocompleteUrl = "https://places.googleapis.com/v1/places:autocomplete";
const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";

const SearchBar = ({ setHomeLocation, setShowHomeSearch }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const requestBody = {
      input: query,
      languageCode: "en",
      regionCode: "US",
    };

    try {
      const response = await fetch(`${autocompleteUrl}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.suggestions) {
        const places = data.suggestions.map((item) => ({
          placeId: item.placePrediction.placeId,
          description: `${
            item.placePrediction.structuredFormat.mainText.text
          }, ${
            item.placePrediction.structuredFormat.secondaryText?.text || ""
          }`,
        }));
        setSuggestions(places);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching autocomplete:", error);
      setSuggestions([]);
    }
  };

  const handleSelectLocation = async (place) => {
    try {
      const response = await fetch(
        `${geocodeUrl}?address=${encodeURIComponent(
          place.description
        )}&key=${API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const selectedLocation = {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
        };

        setHomeLocation(selectedLocation); // Place marker on map
        setShowHomeSearch(false); // Hide search bar
        setErrorMessage(""); // Clear error message
        console.log("this has happened!");
      } else {
        setErrorMessage("No valid location found. Try again.");
      }
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      setErrorMessage("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-96 bg-white p-4 shadow-md rounded-lg z-50">
      <input
        type="text"
        className="w-full border p-2 rounded-lg"
        placeholder="Enter home location..."
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          handleSearch(e.target.value);
          setErrorMessage(""); // Clear error when typing
        }}
      />
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}

      {suggestions.length > 0 && (
        <ul className="mt-2 bg-white border rounded-lg shadow-lg">
          {suggestions.map((place, index) => (
            <li
              key={index}
              className="p-3 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectLocation(place)}
            >
              {place.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
