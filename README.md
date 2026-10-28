# Daylight weather dashboard

A responsive weather dashboard built with plain HTML, CSS, and JavaScript ES modules. It uses Open-Meteo for city search and live weather data; no API key is required.

## Features

- Search for a city and choose between matching locations.
- View current temperature, weather conditions, humidity, wind, and a seven-day forecast.
- Switch between Celsius and Fahrenheit; the unit preference is remembered.
- Add and remove favourite cities. Favourite locations and the last viewed city are saved in `localStorage`.
- Load the weather for your device's location, with clear permission and availability messages.
- Cancel superseded network requests and show animated skeleton cards while weather loads.
- Responsive layout with accessible status messages and keyboard-friendly controls.

## API used

- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) finds matching cities and their coordinates.
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs) provides current conditions and daily forecast data.

Both APIs are free to use without an API key. The browser's Geolocation API is used only when location is requested or when location permission has already been granted.

## Run locally

Serve this folder with a local web server (for example, the VS Code Live Server extension) and open `index.html`. Serving over `http://localhost` is recommended because browsers may restrict geolocation and JavaScript modules on `file://` pages. Geolocation also requires a secure context such as localhost or HTTPS.

## Screenshots

<!-- Screenshot placeholder: add a dashboard screenshot here. -->

_Screenshot placeholder — capture the dashboard after launching the app._

## What I learned

- How to chain asynchronous geocoding and forecast requests with `async`/`await`.
- How to render API data safely with DOM elements and `textContent`.
- How to cancel outdated requests with `AbortController`.
- How to convert and persist user preferences and favourite locations with `localStorage`.
- How to handle geolocation permissions and present loading, empty, and error states accessibly.
