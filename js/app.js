import { getForecast, searchCity } from "./api.js";
import { weatherCodes } from "./weatherCodes.js";
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

const favouriteNames = ["Lagos", "London", "Tokyo", "New York"];

function showCity(city, forecast) {
  const currentConditions = weatherCodes[forecast.current.weather_code] ?? {
    label: "Unknown conditions",
    emoji: "🌡️",
  };
  const weather = {
    ...city,
    temperature: forecast.current.temperature_2m,
    humidity: forecast.current.relative_humidity_2m,
    wind: forecast.current.wind_speed_10m,
    time: forecast.current.time,
    condition: currentConditions.label,
    icon: currentConditions.emoji,
  };
  const dailyForecast = forecast.daily.time.map((date, index) => {
    const conditions = weatherCodes[forecast.daily.weather_code[index]] ?? {
      label: "Unknown conditions",
      emoji: "🌡️",
    };
    return {
      day: index === 0
        ? "Today"
        : new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" })
          .format(new Date(`${date}T12:00:00Z`)),
      icon: conditions.emoji,
      condition: conditions.label,
      high: forecast.daily.temperature_2m_max[index],
      low: forecast.daily.temperature_2m_min[index],
    };
  });

  renderCurrentWeather(currentWeather, weather);
  renderForecast(forecastList, dailyForecast);
  renderFavourites(favouritesList, favourites, weather, (name) => loadCity(name));
  setStatus(statusMessage, errorMessage);
}

async function loadCity(query) {
  setStatus(statusMessage, errorMessage, "Loading…");
  searchForm.querySelector("button").disabled = true;

  try {
    const cities = await searchCity(query);
    if (cities.length === 0) {
      setStatus(statusMessage, errorMessage, `No cities found for "${query.trim()}". Try another city.`, true);
      return;
    }

    const city = cities[0];
    const forecast = await getForecast(city.latitude, city.longitude);
    showCity(city, forecast);
    searchInput.value = "";
  } catch (error) {
    setStatus(statusMessage, errorMessage, error.message, true);
  } finally {
    searchForm.querySelector("button").disabled = false;
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  try {
    await loadCity(query);
  } catch (error) {
    setStatus(statusMessage, errorMessage, error.message, true);
  }
});

renderDate(document.querySelector("#today-date"));
favourites = favouriteNames;
favouriteCount.textContent = String(favourites.length).padStart(2, "0");
renderFavourites(favouritesList, favourites, { name: "" }, (name) => loadCity(name));
loadCity("Lagos");
