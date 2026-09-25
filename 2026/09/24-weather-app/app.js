let search = document.getElementById("search");
let city = document.getElementById("city");
let weatherValue = document.getElementById("weather");

search.addEventListener("click", function () {
  let cityValue = city.value.trim().toLowerCase();
  // if city value is clicked, show the city value in the console
  // reset the city value after the click

  if (cityValue) {
    getLocation(cityValue);
    // cityValue = ""; // does not clear the input field
    city.value = ""; // clears the input field
  } else {
    alert("City not found");
  }
});

async function getLocation(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;

  try {
    if (cityName) {
      const response = await fetch(url);
      const result = await response.json();

      // edge case: if the city is not found, show the error message
      if (!result.results || result.results.length === 0) {
        weatherValue.textContent = "City not found";
        return;
      }

      let longitude = result.results[0].longitude;
      let latitude = result.results[0].latitude;
      console.log(longitude, latitude);

      let place = result.results[0].name;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherResult = await weatherResponse.json();
      console.log(weatherResult.current.temperature_2m);
      // add city name to the weather value
      //   weatherValue.textContent = `${place} : ${weatherResult.current.temperature_2m}°C`;

      // adding weather code details to the weather value
      const labels = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snowfall",
        73: "Moderate snowfall",
        75: "Heavy snowfall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        97: "Heavy thunderstorm",
        99: "Thunderstorm with heavy hail",
      };
      let weatherCode = weatherResult.current.weather_code;
      let weatherDescription = labels[weatherCode];
      weatherValue.textContent = `${place} : ${weatherResult.current.temperature_2m}°C : ${weatherDescription}`;
    } else {
      alert("City not found");
    }
  } catch (error) {
    alert("City not found");
  }
}
