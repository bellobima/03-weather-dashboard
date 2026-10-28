import { getForecast, searchCity } from "./api.js";
import { weatherCodes } from "./weatherCodes.js";
import {
  renderCityChoices,
  renderCurrentWeather,
  renderDate,
  renderFavourites,
  renderForecast,
  renderSkeleton,
  setStatus,
} from "./ui.js";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#city-search");
const unitToggle = document.querySelector("#unit-toggle");
const locationButton = document.querySelector("#location-button");
const cityChoices = document.querySelector("#city-choices");
const currentWeather = document.querySelector("#current-weather");
const forecastList = document.querySelector("#forecast-list");
const favouritesList = document.querySelector("#favourites-list");
const favouriteCount = document.querySelector("#favourite-count");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");

const FAVORITES_KEY = "weather-favourites";
const LAST_CITY_KEY = "weather-last-city";
let favourites = readFavorites();
let currentUnit = readUnit();
let activeController;
let selectedCity;
let selectedForecast = [];

function readUnit() {
  try {
    return localStorage.getItem("weather-unit") === "F" ? "F" : "C";
  } catch (error) {
    setStatus(statusMessage, errorMessage, `Couldn't read your saved temperature unit: ${error.message}`, true);
    return "C";
  }
}

function readFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
    if (!Array.isArray(stored)) {
      throw new Error("Saved favourites must be a list.");
    }
    return stored.filter((city) => city
      && typeof city.name === "string"
      && typeof city.country === "string"
      && Number.isFinite(city.latitude)
      && Number.isFinite(city.longitude))
      .map(({ name, country, latitude, longitude }) => ({ name, country, latitude, longitude }));
  } catch (error) {
    setStatus(statusMessage, errorMessage, `Couldn't read saved favourites: ${error.message}`, true);
    return [];
  }
}

function updateUnitToggle() {
  unitToggle.textContent = `°${currentUnit}`;
  unitToggle.setAttribute("aria-label", `Switch to ${currentUnit === "C" ? "Fahrenheit" : "Celsius"}`);
  unitToggle.setAttribute("aria-pressed", String(currentUnit === "F"));
}

function isFavorite(city) {
  return favourites.some((favorite) => favorite.name === city.name
    && favorite.country === city.country
    && favorite.latitude === city.latitude
    && favorite.longitude === city.longitude);
}

function updateFavoriteCount() {
  favouriteCount.textContent = String(favourites.length).padStart(2, "0");
}

function toggleFavorite() {
  const favoriteCity = {
    name: selectedCity.name,
    country: selectedCity.country,
    latitude: selectedCity.latitude,
    longitude: selectedCity.longitude,
  };
  const updatedFavorites = isFavorite(favoriteCity)
    ? favourites.filter((city) => !(
      city.name === favoriteCity.name
      && city.country === favoriteCity.country
      && city.latitude === favoriteCity.latitude
      && city.longitude === favoriteCity.longitude
    ))
    : [...favourites, favoriteCity];

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    favourites = updatedFavorites;
    updateFavoriteCount();
    renderWeather();
    setStatus(statusMessage, errorMessage);
  } catch (error) {
    setStatus(statusMessage, errorMessage, `Couldn't save your favourites: ${error.message}`, true);
  }
}

function renderWeather() {
  if (!selectedCity) {
    return;
  }
  renderCurrentWeather(currentWeather, selectedCity, currentUnit, isFavorite(selectedCity), toggleFavorite);
  renderForecast(forecastList, selectedForecast, currentUnit);
  renderFavourites(favouritesList, favourites, selectedCity, currentUnit, (city) => loadForecast(city));
}

function startRequest() {
  activeController?.abort();
  if (currentWeather.getAttribute("aria-busy") === "true") {
    restoreWeatherAfterPendingRequest();
  }
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

function showSkeleton(message = "Loading weather…") {
  renderSkeleton(currentWeather, forecastList);
  statusMessage.classList.add("loading-status");
  setStatus(statusMessage, errorMessage, message);
}

function restoreWeatherAfterPendingRequest() {
  hideSkeletonStatus();
  if (selectedCity) {
    renderWeather();
  } else {
    currentWeather.replaceChildren();
    currentWeather.setAttribute("aria-busy", "false");
    forecastList.replaceChildren();
  }
}

function hideSkeletonStatus() {
  statusMessage.classList.remove("loading-status");
}

async function loadCity(query, selectFirstMatch = false) {
  const controller = startRequest();
  cityChoices.replaceChildren();
  cityChoices.hidden = true;
  hideSkeletonStatus();
  setStatus(statusMessage, errorMessage, "Searching locations…");

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
  }
}

async function loadForecastForCity(city, controller) {
  showSkeleton();
  try {
    const forecast = await getForecast(city.latitude, city.longitude, { signal: controller.signal });
    if (controller.signal.aborted) {
      return;
    }
    const weather = makeWeather(city, forecast);
    selectedCity = weather.city;
    selectedForecast = weather.dailyForecast;
    renderWeather();
    hideSkeletonStatus();
    setStatus(statusMessage, errorMessage);
    searchInput.value = "";
    cityChoices.replaceChildren();
    cityChoices.hidden = true;
    try {
      localStorage.setItem(LAST_CITY_KEY, JSON.stringify({
        name: city.name,
        country: city.country,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
      }));
    } catch (error) {
      setStatus(statusMessage, errorMessage, `Weather loaded, but the last city couldn't be saved: ${error.message}`, true);
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      restoreWeatherAfterPendingRequest();
      setStatus(statusMessage, errorMessage, error.message, true);
    }
  }
}

async function loadForecast(city) {
  try {
    const controller = startRequest();
    cityChoices.replaceChildren();
    cityChoices.hidden = true;
    await loadForecastForCity(city, controller);
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus(statusMessage, errorMessage, error.message, true);
    }
  }
}

function geolocationError(error) {
  if (error.code === 1) {
    return "Location permission was denied. Allow location access in your browser settings, or search for a city instead.";
  }
  if (error.code === 2) {
    return "Your location couldn't be determined. Check that location services are enabled, or search for a city.";
  }
  if (error.code === 3) {
    return "Location request timed out. Please try again or search for a city.";
  }
  return `Unable to get your location: ${error.message || "unknown error"}`;
}

async function loadCurrentLocation() {
  const controller = startRequest();
  cityChoices.replaceChildren();
  cityChoices.hidden = true;

  if (!navigator.geolocation) {
    setStatus(statusMessage, errorMessage, "Location isn't supported by this browser. Search for a city instead.", true);
    return;
  }

  locationButton.disabled = true;
  setStatus(statusMessage, errorMessage, "Waiting for location permission…");
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 300000,
      });
    });
    if (controller.signal.aborted) {
      return;
    }
    const city = {
      name: "My location",
      country: "Local forecast",
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    await loadForecastForCity(city, controller);
  } catch (error) {
    if (!controller.signal.aborted) {
      setStatus(statusMessage, errorMessage, error.code ? geolocationError(error) : `Unable to get your location: ${error.message}`, true);
    }
  } finally {
    locationButton.disabled = false;
  }
}

function setUnit(unit) {
  currentUnit = unit;
  updateUnitToggle();
  try {
    localStorage.setItem("weather-unit", currentUnit);
    setStatus(statusMessage, errorMessage);
  } catch (error) {
    setStatus(statusMessage, errorMessage, `Unit changed, but couldn't save your preference: ${error.message}`, true);
  }
  renderWeather();
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
  setUnit(currentUnit === "C" ? "F" : "C");
});

locationButton.addEventListener("click", async () => {
  try {
    await loadCurrentLocation();
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus(statusMessage, errorMessage, error.message, true);
    }
  }
});

async function initialize() {
  renderDate(document.querySelector("#today-date"));
  updateUnitToggle();
  updateFavoriteCount();
  renderFavourites(favouritesList, favourites, null, currentUnit, (city) => loadForecast(city));

  try {
    let permissionState = "prompt";
    if (navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        permissionState = permission.state;
      } catch {
        permissionState = "prompt";
      }
    }

    if (permissionState === "granted" && navigator.geolocation) {
      await loadCurrentLocation();
      return;
    }

    let lastCity = null;
    try {
      const saved = localStorage.getItem(LAST_CITY_KEY);
      lastCity = saved ? JSON.parse(saved) : null;
    } catch (error) {
      setStatus(statusMessage, errorMessage, `Couldn't restore your last city: ${error.message}`, true);
    }
    if (lastCity
      && typeof lastCity.name === "string"
      && typeof lastCity.country === "string"
      && Number.isFinite(lastCity.latitude)
      && Number.isFinite(lastCity.longitude)) {
      await loadForecast(lastCity);
      return;
    }
    await loadCity("Lagos", true);
  } catch (error) {
    setStatus(statusMessage, errorMessage, `Couldn't restore the dashboard: ${error.message}`, true);
  }
}

initialize();
