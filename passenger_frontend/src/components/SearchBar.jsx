import { useState } from "react";

const API_KEY = "AIzaSyAnMQ1Kb2Bsm8FZk96U33_ATy8AFLFkdhU";
const autocompleteUrl = "https://places.googleapis.com/v1/places:autocomplete";
const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";

const SearchBar = ({ setHomeLocation, setShowHomeSearch, setDestination }) => {
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

        // Update the search bar with the selected description
        setInputValue(place.description); // Set the search bar text to the selected place

        // Set home location and close the search bar
        setHomeLocation({
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          location_name: place.description,
        });
        console.log(selectedLocation);

        setSuggestions([]); // Clear suggestions after selecting a place
        setErrorMessage(""); // Clear any error message
      } else {
        setErrorMessage("No valid location found. Try again.");
      }
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      setErrorMessage("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="flex w-3/4 ml-10 flex-col">
      <input
        type="text"
        className="w-full border p-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ease-in-out duration-200 text-lg font-medium"
        placeholder="Enter Destination"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          handleSearch(e.target.value); // Trigger search as user types
          setErrorMessage(""); // Clear error when typing
        }}
      />
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}

      {suggestions.length > 0 && (
        <ul className="mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((place, index) => (
            <li
              key={index}
              className="p-3 cursor-pointer hover:bg-indigo-100 transition-all ease-in-out duration-150"
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
