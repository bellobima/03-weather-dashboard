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
  const localTime = city.time?.split("T").at(-1) ?? "Unavailable";
  element.innerHTML = `
    <div class="current-meta">
      <div>
        <div class="location-label">CURRENT WEATHER</div>
        <h2 class="current-location">${escapeHtml(city.name)}, ${escapeHtml(city.country)}</h2>
        <div class="local-time">Local time · ${escapeHtml(localTime)}</div>
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
      <div class="detail-item"><span class="detail-icon" aria-hidden="true">◷</span><span>Humidity</span><strong>${escapeHtml(city.humidity)}%</strong></div>
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

  favourites.forEach((name) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "favourite-link";
    button.type = "button";
    const isSelected = name.toLocaleLowerCase() === selectedCity.name?.toLocaleLowerCase();
    button.setAttribute("aria-current", String(isSelected));
    button.setAttribute("aria-label", `Show weather for ${name}`);
    button.innerHTML = `
      <span class="favourite-city">
        <span class="favourite-icon" aria-hidden="true">${isSelected ? escapeHtml(selectedCity.icon) : "📍"}</span>
        <span>
          <span class="favourite-name">${escapeHtml(name)}</span>
          <span class="favourite-condition">${isSelected ? escapeHtml(selectedCity.condition) : "View forecast"}</span>
        </span>
      </span>
      <span class="favourite-temperature">${isSelected ? `${escapeHtml(selectedCity.temperature)}° <span>C</span>` : "→"}</span>
    `;
    button.addEventListener("click", () => onSelect(name));
    item.append(button);
    element.append(item);
  });
}

export function setStatus(statusElement, errorElement, message = "", isError = false) {
  statusElement.textContent = isError ? "" : message;
  errorElement.textContent = isError ? message : "";
  errorElement.hidden = !isError;
}
