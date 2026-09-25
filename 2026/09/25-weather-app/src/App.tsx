export default function App() {
  return (
    // change to light mode
    <div className="grid min-h-screen place-items-center bg-white text-black">
      {/* build a weather app 
      - user search for a city
      - there's a form with an input and a button ✅
      - when the user submits the form, the app should fetch the weather data for the city
      - the app should display the weather data in a nice way
      - the app should have a nice UI and be responsive
      - we should have a state/div where we can show the weather data
      - add a visible result container where we can show the weather data
      - add a prevent default on the form submission and add a console.log to the event ✅
      */}
      <form
        className="flex flex-col items-center justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          console.log("form submitted");
        }}
      >
        <input
          className="border-2 border-gray-300 rounded-md p-2"
          type="text"
          placeholder="Enter a city name"
        />
        <button
          className="bg-blue-500 text-white rounded-md p-2 w-full mt-2"
          type="submit"
        >
          Search city
        </button>
      </form>
      {/* add a result container where we can show the weather data */}
      {/* if the weather data is not available, show a message, and the background color for the result container should be light gray */}
      <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-md">
        <h1>No weather data available </h1>
        <p className="text-sm text-gray-500">
          Please try again with a different city
        </p>
      </div>
    </div>
  );
}
