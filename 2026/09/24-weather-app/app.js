let search = document.getElementById("search");
let city = document.getElementById("city");

search.addEventListener("click", function () {
  let cityValue = city.value.trim().toLowerCase();
  // if city value is clicked, show the city value in the console
  // reset the city value after the click

  if (cityValue) {
    getLocation(cityValue);
    cityValue = "";
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
      let longitude = result.results[0].longitude;
      let latitude = result.results[0].latitude;
      console.log(longitude, latitude);
    } else {
      alert("City not found");
    }
  } catch (error) {
    alert("City not found");
  }
}
