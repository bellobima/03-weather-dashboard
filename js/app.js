import { getForecast, searchCity } from "./api.js";
import { weatherCodes } from "./weatherCodes.js";
import {
  renderCityChoices,
  renderCurrentWeather,
  renderDate,
  renderFavourites,
  renderForecast,
  setStatus,
} from "./ui.js";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#city-search");
const searchButton = searchForm.querySelector("button");
const unitToggle = document.querySelector("#unit-toggle");
const cityChoices = document.querySelector("#city-choices");
const currentWeather = document.querySelector("#current-weather");
const forecastList = document.querySelector("#forecast-list");
const favouritesList = document.querySelector("#favourites-list");
const favouriteCount = document.querySelector("#favourite-count");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");

const favourites = ["Lagos", "London", "Tokyo", "New York"].map((name) => ({ name }));
let currentUnit = localStorage.getItem("weather-unit") === "F" ? "F" : "C";
let activeController;
let selectedCity;
let selectedForecast = [];

function updateUnitToggle() {
  unitToggle.textContent = `°${currentUnit}`;
  unitToggle.setAttribute("aria-label", `Switch to ${currentUnit === "C" ? "Fahrenheit" : "Celsius"}`);
  unitToggle.setAttribute("aria-pressed", String(currentUnit === "F"));
}

function renderWeather() {
  if (!selectedCity) {
    return;
  }
  renderCurrentWeather(currentWeather, selectedCity, currentUnit);
  renderForecast(forecastList, selectedForecast, currentUnit);
  renderFavourites(favouritesList, favourites, selectedCity, currentUnit, (name) => {
    loadCity(name, true);
  });
}

function startRequest() {
  activeController?.abort();
  activeController = new AbortController();
  return activeController;
}

function makeWeather(city, forecast) {
  const currentConditions = weatherCodes[forecast.current.weather_code] ?? {
    label: "Unknown conditions",
    emoji: "🌡️",
  };
  const dailyForecast = forecast.daily.time.map((date, index) => {
    const conditions = weatherCodes[forecast.daily.weather_code[index]] ?? {
      label: "Unknown conditions",
      emoji: "🌡️",
    };
    const weekday = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
    return {
      day: weekday,
      icon: conditions.emoji,
      condition: conditions.label,
      high: forecast.daily.temperature_2m_max[index],
      low: forecast.daily.temperature_2m_min[index],
    };
  });

  return {
    city: {
      ...city,
      temperature: forecast.current.temperature_2m,
      humidity: forecast.current.relative_humidity_2m,
      wind: forecast.current.wind_speed_10m,
      time: forecast.current.time,
      condition: currentConditions.label,
      icon: currentConditions.emoji,
    },
    dailyForecast,
  };
}

async function loadCity(query, selectFirstMatch = false) {
  const controller = startRequest();
  cityChoices.replaceChildren();
  cityChoices.hidden = true;
  setStatus(statusMessage, errorMessage, "Loading…");
  searchButton.disabled = true;

  try {
    const cities = await searchCity(query, { signal: controller.signal });
    if (controller.signal.aborted) {
      return;
    }
    if (cities.length === 0) {
      setStatus(statusMessage, errorMessage, `No cities found for "${query.trim()}". Try another city.`, true);
      return;
    }
    if (cities.length > 1 && !selectFirstMatch) {
      renderCityChoices(cityChoices, cities, (city) => loadForecast(city));
      setStatus(statusMessage, errorMessage, "Choose a location from the list.");
      return;
    }

    await loadForecastForCity(cities[0], controller);
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus(statusMessage, errorMessage, error.message, true);
    }
  } finally {
    if (activeController === controller) {
      searchButton.disabled = false;
    }
  }
}

async function loadForecastForCity(city, controller) {
  setStatus(statusMessage, errorMessage, "Loading…");
  searchButton.disabled = true;
  try {
    const forecast = await getForecast(city.latitude, city.longitude, { signal: controller.signal });
    if (controller.signal.aborted) {
      return;
    }
    const weather = makeWeather(city, forecast);
    selectedCity = weather.city;
    selectedForecast = weather.dailyForecast;
    renderWeather();
    setStatus(statusMessage, errorMessage);
    searchInput.value = "";
    cityChoices.replaceChildren();
    cityChoices.hidden = true;
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus(statusMessage, errorMessage, error.message, true);
    }
  } finally {
    if (activeController === controller) {
      searchButton.disabled = false;
    }
  }
}

async function loadForecast(city) {
  const controller = startRequest();
  cityChoices.replaceChildren();
  cityChoices.hidden = true;
  setStatus(statusMessage, errorMessage, "Loading…");
  searchButton.disabled = true;
  try {
    await loadForecastForCity(city, controller);
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus(statusMessage, errorMessage, error.message, true);
    }
  } finally {
    if (activeController === controller) {
      searchButton.disabled = false;
    }
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await loadCity(searchInput.value.trim());
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus(statusMessage, errorMessage, error.message, true);
    }
  }
});

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";
  updateUnitToggle();
  try {
    localStorage.setItem("weather-unit", currentUnit);
  } catch (error) {
    setStatus(statusMessage, errorMessage, `Unit changed, but couldn't save your preference: ${error.message}`, true);
  }
  renderWeather();
});

renderDate(document.querySelector("#today-date"));
updateUnitToggle();
favouriteCount.textContent = String(favourites.length).padStart(2, "0");
renderFavourites(favouritesList, favourites, null, currentUnit, (name) => loadCity(name, true));
loadCity("Lagos", true);
