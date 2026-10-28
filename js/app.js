import { getFavouriteCities, searchCity } from "./api.js";
import {
  renderCurrentWeather,
  renderDate,
  renderFavourites,
  renderForecast,
  setStatus,
} from "./ui.js";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#city-search");
const currentWeather = document.querySelector("#current-weather");
const forecastList = document.querySelector("#forecast-list");
const favouritesList = document.querySelector("#favourites-list");
const favouriteCount = document.querySelector("#favourite-count");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");

let favourites = [];
let selectedCity;

function showCity(city) {
  selectedCity = city;
  renderCurrentWeather(currentWeather, city);
  renderForecast(forecastList, city.forecast);
  renderFavourites(favouritesList, favourites, city, showCity);
  setStatus(statusMessage, errorMessage);
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value;
  setStatus(statusMessage, errorMessage, "Looking up your city...");
  searchForm.querySelector("button").disabled = true;

  try {
    const city = await searchCity(query);
    showCity(city);
    searchInput.value = "";
  } catch (error) {
    setStatus(statusMessage, errorMessage, error.message, true);
  } finally {
    searchForm.querySelector("button").disabled = false;
  }
});

renderDate(document.querySelector("#today-date"));
getFavouriteCities()
  .then((cities) => {
    favourites = cities;
    favouriteCount.textContent = String(favourites.length).padStart(2, "0");
    showCity(favourites[0]);
  })
  .catch((error) => {
    setStatus(statusMessage, errorMessage, `Unable to load sample cities: ${error.message}`, true);
  });
