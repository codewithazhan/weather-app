const weatherCodes = {
  0: ["Clear Sky", "☀️"],
  1: ["Mainly Clear", "🌤️"],
  2: ["Partly Cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Fog", "🌫️"],
  51: ["Light Drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy Drizzle", "🌧️"],
  61: ["Light Rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy Rain", "🌧️"],
  71: ["Light Snow", "🌨️"],
  73: ["Snow", "❄️"],
  75: ["Heavy Snow", "❄️"],
  80: ["Rain Showers", "🌦️"],
  81: ["Rain Showers", "🌧️"],
  82: ["Heavy Showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm", "⛈️"],
  99: ["Heavy Thunderstorm", "⛈️"]
};

async function searchCity() {

  const city = document
    .getElementById("cityInput")
    .value
    .trim();

  if (!city) {
    showError("Please enter a city.");
    return;
  }

  try {

    showLoading();

    
    const geoURL =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) {
      throw new Error("Location search failed.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found.");
    }

    const place = geoData.results[0];

    const latitude = place.latitude;
    const longitude = place.longitude;

    const country = place.country || "";

    
    const weatherURL =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto` +
      `&forecast_days=7`;

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
      throw new Error("Weather data unavailable.");
    }

    const weather = await weatherResponse.json();

    displayWeather(
      place.name,
      country,
      weather
    );

  } catch (error) {

    console.error(error);

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loading").style.display = "none";

    showError(
      error.message || "Something went wrong."
    );
  }
}


function displayWeather(city, country, data) {

  document.getElementById("loading").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("error").style.display = "none";

  const current = data.current;

  
  document.getElementById("location").textContent =
    `${city}, ${country}`;

  
  const now = new Date();

  document.getElementById("date").textContent =
    now.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    );

  
  document.getElementById("temperature").textContent =
    `${Math.round(current.temperature_2m)}°C`;

  
  const code = current.weather_code;

  const info =
    weatherCodes[code] ||
    ["Unknown", "🌤️"];

  document.getElementById("condition").textContent =
    info[0];

  document.getElementById("weatherIcon").textContent =
    info[1];

  
  document.getElementById("humidity").textContent =
    `${current.relative_humidity_2m}%`;

  document.getElementById("wind").textContent =
    `${Math.round(current.wind_speed_10m)} km/h`;

  document.getElementById("feels").textContent =
    `${Math.round(current.apparent_temperature)}°C`;

  document.getElementById("rain").textContent =
    `${current.precipitation} mm`;

  
  createForecast(data.daily);
}


function createForecast(daily) {

  const container =
    document.getElementById("forecast");

  container.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {

    const date = new Date(
      daily.time[i] + "T12:00:00"
    );

    const dayName =
      date.toLocaleDateString(
        "en-US",
        { weekday: "short" }
      );

    const code =
      daily.weather_code[i];

    const info =
      weatherCodes[code] ||
      ["Unknown", "🌤️"];

    const max =
      Math.round(
        daily.temperature_2m_max[i]
      );

    const min =
      Math.round(
        daily.temperature_2m_min[i]
      );

    const card =
      document.createElement("div");

    card.className = "day";

    card.innerHTML = `
      <div class="day-name">
        ${dayName}
      </div>

      <div class="day-icon">
        ${info[1]}
      </div>

      <div class="day-temp">
        ${max}° / ${min}°
      </div>
    `;

    container.appendChild(card);
  }
}


function showLoading() {

  document.getElementById("loading").style.display =
    "block";

  document.getElementById("loading").textContent =
    "Loading weather...";

  document.getElementById("dashboard").style.display =
    "none";

  document.getElementById("error").style.display =
    "none";
}


function showError(message) {

  const error =
    document.getElementById("error");

  error.textContent = message;
  error.style.display = "block";
}



document
  .getElementById("cityInput")
  .addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
      searchCity();
    }

  });


searchCity();

