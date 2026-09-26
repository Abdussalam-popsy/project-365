import { useState } from "react";

export default function App() {
  const [city, setCity] = useState("");

  // create a function called getLocation that uses the fetch api to get the location data for the city
  const getLocation = async (city: string) => {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`,
    );
    const data = await response.json();
    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;
    console.log(latitude, longitude);

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&forecast_days=1`,
    );
    const weatherData = await weatherResponse.json();
    console.log(weatherData);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-white text-black">
      {/* add a usestate for the city string and update it when the user submits the form */}

      <div className="flex flex-col items-center justify-center gap-4">
        <form
          className="flex flex-col items-center justify-center"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("form submitted: ", city.trim().toLowerCase());
            getLocation(city);
          }}
        >
          <input
            className="border-2 border-gray-300 rounded-md p-2"
            type="text"
            placeholder="Enter a city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white rounded-md p-2 w-full mt-2"
            type="submit"
          >
            Search city
          </button>
        </form>

        <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-md">
          <h1>No weather data available </h1>
          <p className="text-sm text-gray-500">
            Please try again with a different city
          </p>
        </div>
      </div>
    </div>
  );
}
