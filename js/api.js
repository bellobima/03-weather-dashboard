const cities = {
  lagos: {
    name: "Lagos",
    country: "Nigeria",
    countryCode: "NG",
    temperature: 29,
    condition: "Partly cloudy",
    icon: "🌤️",
    wind: 14,
    time: "09:41 AM",
    forecast: [
      { day: "Today", icon: "🌤️", high: 31, low: 25 },
      { day: "Wed", icon: "⛅", high: 30, low: 25 },
      { day: "Thu", icon: "🌦️", high: 29, low: 24 },
      { day: "Fri", icon: "🌧️", high: 28, low: 24 },
      { day: "Sat", icon: "⛅", high: 30, low: 25 },
      { day: "Sun", icon: "☀️", high: 32, low: 25 },
      { day: "Mon", icon: "🌤️", high: 31, low: 24 },
    ],
  },
  london: {
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    temperature: 16,
    condition: "Cloudy",
    icon: "☁️",
    wind: 11,
    time: "09:41 AM",
    forecast: [
      { day: "Today", icon: "☁️", high: 18, low: 12 },
      { day: "Wed", icon: "🌦️", high: 17, low: 11 },
      { day: "Thu", icon: "🌧️", high: 15, low: 10 },
      { day: "Fri", icon: "⛅", high: 17, low: 11 },
      { day: "Sat", icon: "🌤️", high: 19, low: 12 },
      { day: "Sun", icon: "☀️", high: 20, low: 13 },
      { day: "Mon", icon: "⛅", high: 18, low: 12 },
    ],
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    temperature: 22,
    condition: "Clear skies",
    icon: "☀️",
    wind: 8,
    time: "05:41 PM",
    forecast: [
      { day: "Today", icon: "☀️", high: 24, low: 17 },
      { day: "Wed", icon: "🌤️", high: 23, low: 16 },
      { day: "Thu", icon: "⛅", high: 22, low: 17 },
      { day: "Fri", icon: "🌧️", high: 20, low: 16 },
      { day: "Sat", icon: "🌦️", high: 21, low: 15 },
      { day: "Sun", icon: "🌤️", high: 23, low: 16 },
      { day: "Mon", icon: "☀️", high: 25, low: 18 },
    ],
  },
  "new york": {
    name: "New York",
    country: "United States",
    countryCode: "US",
    temperature: 19,
    condition: "Mostly sunny",
    icon: "🌤️",
    wind: 13,
    time: "04:41 AM",
    forecast: [
      { day: "Today", icon: "🌤️", high: 21, low: 14 },
      { day: "Wed", icon: "☀️", high: 23, low: 15 },
      { day: "Thu", icon: "⛅", high: 20, low: 14 },
      { day: "Fri", icon: "🌦️", high: 18, low: 13 },
      { day: "Sat", icon: "🌧️", high: 17, low: 12 },
      { day: "Sun", icon: "🌤️", high: 20, low: 13 },
      { day: "Mon", icon: "☀️", high: 22, low: 15 },
    ],
  },
};

const favouriteCities = ["Lagos", "London", "Tokyo", "New York"];

function cloneCity(city) {
  return { ...city, forecast: city.forecast.map((day) => ({ ...day })) };
}

export async function searchCity(query) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    throw new Error("Enter a city name to search.");
  }

  const city = cities[normalizedQuery];
  if (!city) {
    throw new Error(`No sample forecast is available for "${query.trim()}". Try Lagos, London, Tokyo, or New York.`);
  }

  return cloneCity(city);
}

export async function getFavouriteCities() {
  return favouriteCities.map((name) => cloneCity(cities[name.toLocaleLowerCase()]));
}
