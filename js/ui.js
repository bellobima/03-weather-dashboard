function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function formatTemperature(value, unit) {
  const converted = unit === "F" ? (value * 9) / 5 + 32 : value;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(converted);
}

function getLocalDate() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function renderDate(element) {
  element.textContent = getLocalDate();
}

export function renderCurrentWeather(element, city, unit) {
  const localTime = city.time?.split("T").at(-1) ?? "Unavailable";
  const meta = createElement("div", "current-meta");
  const location = createElement("div");
  location.append(
    createElement("div", "location-label", "CURRENT WEATHER"),
    createElement("h2", "current-location", `${city.name}, ${city.country}`),
    createElement("div", "local-time", `Local time · ${localTime}`),
  );
  const icon = createElement("span", "current-icon", city.icon);
  icon.setAttribute("role", "img");
  icon.setAttribute("aria-label", city.condition);
  meta.append(location, icon);

  const temperatureLine = createElement("div", "temperature-line");
  temperatureLine.append(
    createElement("span", "current-temperature", formatTemperature(city.temperature, unit)),
    createElement("span", "temperature-unit", `°${unit}`),
  );
  const details = createElement("div", "weather-details");
  const wind = createElement("div", "detail-item");
  wind.append(
    createElement("span", "detail-icon", "↗"),
    createElement("span", "", "Wind"),
    createElement("strong", "", `${city.wind} km/h`),
  );
  const humidity = createElement("div", "detail-item");
  humidity.append(
    createElement("span", "detail-icon", "◷"),
    createElement("span", "", "Humidity"),
    createElement("strong", "", `${city.humidity}%`),
  );
  details.append(wind, humidity);

  const card = document.createDocumentFragment();
  card.append(meta, temperatureLine, createElement("p", "condition", city.condition), details);
  element.replaceChildren(card);
}

export function renderForecast(element, forecast, unit) {
  const cards = forecast.map((day) => {
    const card = createElement("article", "forecast-card");
    const icon = createElement("div", "forecast-icon", day.icon);
    icon.setAttribute("role", "img");
    icon.setAttribute("aria-label", day.condition);

    const temperatures = createElement("div", "forecast-temperatures");
    temperatures.append(
      createElement("span", "", `${formatTemperature(day.high, unit)}°`),
      createElement("span", "forecast-low", `${formatTemperature(day.low, unit)}°`),
    );
    card.append(createElement("div", "forecast-day", day.day), icon, temperatures);
    return card;
  });
  element.replaceChildren(...cards);
}

export function renderFavourites(element, favourites, selectedCity, unit, onSelect) {
  const items = favourites.map((city) => {
    const item = createElement("li");
    const button = createElement("button", "favourite-link");
    const isSelected = city.name.toLocaleLowerCase() === selectedCity?.name?.toLocaleLowerCase();
    button.type = "button";
    button.setAttribute("aria-current", String(isSelected));
    button.setAttribute("aria-label", `Show weather for ${city.name}`);

    const favouriteCity = createElement("span", "favourite-city");
    const icon = createElement("span", "favourite-icon", isSelected ? selectedCity.icon : "📍");
    icon.setAttribute("aria-hidden", "true");
    const description = createElement("span");
    description.append(
      createElement("span", "favourite-name", city.name),
      createElement("span", "favourite-condition", isSelected ? selectedCity.condition : "View forecast"),
    );
    favouriteCity.append(icon, description);
    button.append(
      favouriteCity,
      createElement("span", "favourite-temperature", isSelected
        ? `${formatTemperature(selectedCity.temperature, unit)}° ${unit}`
        : "→"),
    );
    button.addEventListener("click", () => onSelect(city.name));
    item.append(button);
    return item;
  });
  element.replaceChildren(...items);
}

export function renderCityChoices(element, cities, onSelect) {
  const choices = cities.map((city) => {
    const item = createElement("li");
    const button = createElement("button", "city-choice");
    const location = [city.name, city.admin1, city.country].filter(Boolean).join(", ");
    button.type = "button";
    button.textContent = location;
    button.addEventListener("click", () => onSelect(city));
    item.append(button);
    return item;
  });
  element.replaceChildren(...choices);
  element.hidden = choices.length === 0;
}

export function setStatus(statusElement, errorElement, message = "", isError = false) {
  statusElement.textContent = isError ? "" : message;
  errorElement.textContent = isError ? message : "";
  errorElement.hidden = !isError;
}
