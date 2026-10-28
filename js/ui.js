function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
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

export function renderCurrentWeather(element, city) {
  element.innerHTML = `
    <div class="current-meta">
      <div>
        <div class="location-label">CURRENT WEATHER · ${escapeHtml(city.countryCode)}</div>
        <h2 class="current-location">${escapeHtml(city.name)}, ${escapeHtml(city.country)}</h2>
        <div class="local-time">Local time · ${escapeHtml(city.time)}</div>
      </div>
      <span class="current-icon" role="img" aria-label="${escapeHtml(city.condition)}">${escapeHtml(city.icon)}</span>
    </div>
    <div class="temperature-line">
      <span class="current-temperature">${escapeHtml(city.temperature)}</span>
      <span class="temperature-unit">°C</span>
    </div>
    <p class="condition">${escapeHtml(city.condition)}</p>
    <div class="weather-details">
      <div class="detail-item"><span class="detail-icon" aria-hidden="true">↗</span><span>Wind</span><strong>${escapeHtml(city.wind)} km/h</strong></div>
      <div class="detail-item"><span class="detail-icon" aria-hidden="true">◷</span><span>Feels like</span><strong>${escapeHtml(city.temperature)}°</strong></div>
    </div>
  `;
}

export function renderForecast(element, forecast) {
  element.innerHTML = forecast.map((day) => `
    <article class="forecast-card">
      <div class="forecast-day">${escapeHtml(day.day)}</div>
      <div class="forecast-icon" role="img" aria-label="Weather">${escapeHtml(day.icon)}</div>
      <div class="forecast-temperatures">
        <span>${escapeHtml(day.high)}°</span>
        <span class="forecast-low">${escapeHtml(day.low)}°</span>
      </div>
    </article>
  `).join("");
}

export function renderFavourites(element, favourites, selectedCity, onSelect) {
  element.replaceChildren();

  favourites.forEach((city) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "favourite-link";
    button.type = "button";
    button.setAttribute("aria-current", String(city.name === selectedCity.name));
    button.setAttribute("aria-label", `Show weather for ${city.name}`);
    button.innerHTML = `
      <span class="favourite-city">
        <span class="favourite-icon" aria-hidden="true">${escapeHtml(city.icon)}</span>
        <span>
          <span class="favourite-name">${escapeHtml(city.name)}</span>
          <span class="favourite-condition">${escapeHtml(city.condition)}</span>
        </span>
      </span>
      <span class="favourite-temperature">${escapeHtml(city.temperature)}° <span>C</span></span>
    `;
    button.addEventListener("click", () => onSelect(city));
    item.append(button);
    element.append(item);
  });
}

export function setStatus(statusElement, errorElement, message = "", isError = false) {
  statusElement.textContent = isError ? "" : message;
  errorElement.textContent = isError ? message : "";
  errorElement.hidden = !isError;
}
