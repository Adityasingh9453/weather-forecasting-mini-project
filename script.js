// API Configuration - Using OpenWeatherMap (Free API)
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');

// Weather Icons Mapping
const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌋',
    'Squall': '💨',
    'Tornado': '🌪️'
};

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Main Search Function
async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    hideError();
    showLoading();
    hideWeatherCard();

    try {
        // First, get coordinates for the city to ensure accurate location
        const geoData = await fetchGeoLocation(city);
        
        if (!geoData || geoData.length === 0) {
            throw new Error('City not found');
        }
        
        // Use coordinates for most accurate weather data
        const currentWeather = await fetchCurrentWeatherByCoords(geoData[0].lat, geoData[0].lon);
        const forecast = await fetchForecastByCoords(geoData[0].lat, geoData[0].lon);
        
        displayCurrentWeather(currentWeather, geoData[0]);
        displayForecast(forecast);
        
        hideLoading();
        showWeatherCard();
    } catch (error) {
        hideLoading();
        showError('City not found. Please check the spelling and try again.');
        console.error('Error fetching weather:', error);
    }
}

// Fetch Geographic Coordinates (Most accurate method)
async function fetchGeoLocation(city) {
    const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    
    if (!response.ok) {
        throw new Error('Location not found');
    }
    
    return await response.json();
}

// Fetch Current Weather Data by Coordinates (Most Accurate)
async function fetchCurrentWeatherByCoords(lat, lon) {
    const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
        throw new Error('Weather data not available');
    }
    
    return await response.json();
}

// Fetch Weather Forecast Data by Coordinates
async function fetchForecastByCoords(lat, lon) {
    const response = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
        throw new Error('Forecast not available');
    }
    
    return await response.json();
}

// Display Current Weather Information
function displayCurrentWeather(data, geoData) {
    // Get current local time for the location
    const localTime = new Date((data.dt + data.timezone) * 1000);
    const formattedDate = localTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'
    });
    
    const formattedTime = localTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });

    // Display city name with state/country for accuracy
    const locationName = geoData.state 
        ? `${geoData.name}, ${geoData.state}, ${geoData.country}`
        : `${geoData.name}, ${geoData.country}`;

    // Update DOM elements with weather data
    document.getElementById('cityName').textContent = locationName;
    document.getElementById('currentDate').textContent = `${formattedDate} • ${formattedTime} (Local Time)`;
    
    // Show both actual temperature and "feels like"
    const actualTemp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const tempDisplay = feelsLike !== actualTemp 
        ? `${actualTemp}°C (Feels like ${feelsLike}°C)`
        : `${actualTemp}°C`;
    
    document.getElementById('temperature').textContent = tempDisplay;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    
    // Convert wind speed to km/h for better understanding
    const windKmh = (data.wind.speed * 3.6).toFixed(1);
    document.getElementById('windSpeed').textContent = `${windKmh} km/h`;
    
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    // Set weather icon
    const weatherCondition = data.weather[0].main;
    document.getElementById('weatherIcon').textContent = weatherIcons[weatherCondition] || '🌤️';
    
    // Log coordinates for verification
    console.log(`Weather data for: ${locationName}`);
    console.log(`Coordinates: ${geoData.lat}, ${geoData.lon}`);
    console.log(`Data timestamp: ${new Date(data.dt * 1000).toLocaleString()}`);
}

// Display 5-Day Forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Get one forecast per day (at 12:00 PM local time)
    const dailyForecasts = [];
    const processedDates = new Set();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toLocaleDateString('en-US');
        
        // Get midday forecast or first forecast of the day
        if (!processedDates.has(dateString)) {
            dailyForecasts.push(item);
            processedDates.add(dateString);
        }
    });

    // Take first 5 days
    dailyForecasts.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const fullDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const weatherCondition = day.weather[0].main;
        const icon = weatherIcons[weatherCondition] || '🌤️';

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div style="font-size: 0.85em; color: #999; margin-bottom: 5px;">${fullDate}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            <div style="font-size: 0.9em; color: #666; margin-top: 5px;">${day.weather[0].description}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Utility Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
}

function hideError() {
    errorMessage.classList.remove('active');
}

function showLoading() {
    loading.classList.add('active');
}

function hideLoading() {
    loading.classList.remove('active');
}

function showWeatherCard() {
    weatherCard.classList.add('active');
}

function hideWeatherCard() {
    weatherCard.classList.remove('active');
}

// Load default city on page load
window.addEventListener('load', () => {
    cityInput.value = 'London';
    searchWeather();
});