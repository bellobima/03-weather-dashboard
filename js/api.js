const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(`Could not connect to Open-Meteo: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed (${response.status} ${response.statusText}).`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Open-Meteo returned an invalid response: ${error.message}`);
  }
}

export async function searchCity(name) {
  const query = name.trim();
  if (!query) {
    throw new Error("Enter a city name to search.");
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5`;
  try {
    const data = await fetchJson(url);
    return (data.results ?? []).map(({ name: cityName, country, latitude, longitude, timezone }) => ({
      name: cityName,
      country,
      latitude,
      longitude,
      timezone,
    }));
  } catch (error) {
    throw new Error(`Unable to search for "${query}": ${error.message}`);
  }
}

export async function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
  });

  try {
    return await fetchJson(`${FORECAST_URL}?${params}`);
  } catch (error) {
    throw new Error(`Unable to load the forecast: ${error.message}`);
  }
}
