let search = document.getElementById("search");
let city = document.getElementById("city");

search.addEventListener("click", function () {
  let cityValue = city.value.trim().toLowerCase();
  // if city value is clicked, show the city value in the console
  // reset the city value after the click

  if (cityValue) {
    console.log(cityValue);
    cityValue = "";
  } else {
    console.log("City not found");
  }
});
