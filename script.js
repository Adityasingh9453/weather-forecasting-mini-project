// ==================== API CONFIGURATION ====================
// Using Open-Meteo API (No API key required!)
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// Backup: OpenWeatherMap with multiple keys to try
const OWM_KEYS = [
    'b6907d289e10d714a6e88b30761fae22',
    '6f42d0b5e0c2e1f3e8d4a5b6c7d8e9f0',
    'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
];
let currentKeyIndex = 0;

// ==================== DOM ELEMENTS ====================
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const clearBtn = document.getElementById('clearBtn');
const locationBtn = document.getElementById('locationBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationStatus = document.getElementById('notificationStatus');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');

// ==================== WEATHER ICONS MAPPING ====================
const weatherIcons = {
    0: '☀️',   // Clear sky
    1: '🌤️',   // Mainly clear
    2: '⛅',   // Partly cloudy
    3: '☁️',   // Overcast
    45: '🌫️',  // Fog
    48: '🌫️',  // Depositing rime fog
    51: '🌦️',  // Light drizzle
    53: '🌦️',  // Moderate drizzle
    55: '🌧️',  // Dense drizzle
    61: '🌧️',  // Slight rain
    63: '🌧️',  // Moderate rain
    65: '🌧️',  // Heavy rain
    71: '❄️',  // Slight snow
    73: '❄️',  // Moderate snow
    75: '❄️',  // Heavy snow
    77: '❄️',  // Snow grains
    80: '🌦️',  // Slight rain showers
    81: '🌧️',  // Moderate rain showers
    82: '🌧️',  // Violent rain showers
    85: '❄️',  // Slight snow showers
    86: '❄️',  // Heavy snow showers
    95: '⛈️',  // Thunderstorm
    96: '⛈️',  // Thunderstorm with slight hail
    99: '⛈️'   // Thunderstorm with heavy hail
};

const weatherDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Heavy thunderstorm'
};

// ==================== EVENT LISTENERS ====================
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) searchWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) searchWeather(city);
    }
});

cityInput.addEventListener('input', (e) => {
    if (e.target.value) {
        clearBtn.classList.add('active');
    } else {
        clearBtn.classList.remove('active');
    }
});

clearBtn.addEventListener('click', () => {
    cityInput.value = '';
    clearBtn.classList.remove('active');
    cityInput.focus();
});

locationBtn.addEventListener('click', getUserLocation);

// Notification button handler
notificationBtn.addEventListener('click', async () => {
    const granted = await requestNotificationPermission();
    updateNotificationButton();
    
    if (granted) {
        showError('✅ Notifications enabled! You\'ll get weather alerts.');
    } else {
        showError('❌ Notifications blocked. Enable them in browser settings.');
    }
});

// ==================== MAIN SEARCH FUNCTION ====================
async function searchWeather(city) {
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    hideError();
    showLoading();
    hideWeatherCard();

    try {
        console.log('Searching for:', city);
        
        // Get coordinates from city name
        const geoData = await getCoordinates(city);
        
        if (!geoData) {
            throw new Error('City not found');
        }
        
        console.log('Coordinates:', geoData);
        
        // Fetch weather data using coordinates
        const weatherData = await fetchWeather(geoData.latitude, geoData.longitude);
        
        console.log('Weather data:', weatherData);
        
        // Display data
        displayWeather(weatherData, geoData);
        
        // Show notification
        showWeatherNotification(weatherData, geoData);
        
        hideLoading();
        showWeatherCard();
        
        saveRecentSearch(city);
        
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        showError(`Unable to find weather for "${city}". Try: London, Paris, Tokyo, New York`);
    }
}

// ==================== GET USER LOCATION ====================
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();
    hideError();
    hideWeatherCard();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                
                // Get city name from coordinates
                const cityData = await getCityFromCoords(latitude, longitude);
                
                // Fetch weather
                const weatherData = await fetchWeather(latitude, longitude);
                
                // Display
                displayWeather(weatherData, { 
                    name: cityData.name || 'Your Location',
                    country: cityData.country || '',
                    latitude,
                    longitude
                });
                
                // Show notification
                showWeatherNotification(weatherData, {
                    name: cityData.name || 'Your Location',
                    country: cityData.country || ''
                });
                
                cityInput.value = cityData.name || 'Your Location';
                hideLoading();
                showWeatherCard();
                
            } catch (error) {
                hideLoading();
                showError('Unable to fetch weather for your location');
            }
        },
        (error) => {
            hideLoading();
            showError('Location access denied. Please enable location services.');
        }
    );
}

// ==================== API FUNCTIONS ====================

// Get coordinates from city name (No API key needed!)
async function getCoordinates(city) {
    try {
        const url = `${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            return null;
        }
        
        return {
            name: data.results[0].name,
            country: data.results[0].country,
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Get city name from coordinates
async function getCityFromCoords(lat, lon) {
    try {
        const url = `${GEO_API}?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return {
                name: data.results[0].name,
                country: data.results[0].country
            };
        }
        
        return { name: 'Unknown Location', country: '' };
    } catch (error) {
        return { name: 'Unknown Location', country: '' };
    }
}

// Fetch weather data (No API key needed!)
async function fetchWeather(lat, lon) {
    try {
        const url = `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Weather fetch failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Weather fetch error:', error);
        throw error;
    }
}

// ==================== DISPLAY FUNCTIONS ====================

function displayWeather(data, location) {
    console.log('Displaying weather');
    
    const locationName = location.country 
        ? `${location.name}, ${location.country}`
        : location.name;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
    
    const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Current weather
    const current = data.current;
    const weatherCode = current.weather_code;
    
    document.getElementById('cityName').textContent = locationName;
    document.getElementById('currentDate').textContent = `${formattedDate} • ${formattedTime}`;
    document.getElementById('coordinates').textContent = `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`;
    
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    
    document.getElementById('temperature').textContent = `${temp}°C`;
    document.getElementById('feelsLike').textContent = `Feels like ${feelsLike}°C`;
    document.getElementById('description').textContent = weatherDescriptions[weatherCode] || 'Unknown';
    
    // Today's min/max from daily data
    document.getElementById('maxTemp').textContent = `High: ${Math.round(data.daily.temperature_2m_max[0])}°C`;
    document.getElementById('minTemp').textContent = `Low: ${Math.round(data.daily.temperature_2m_min[0])}°C`;
    
    // Details
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${current.wind_speed_10m.toFixed(1)} km/h`;
    document.getElementById('pressure').textContent = `${Math.round(current.pressure_msl)} hPa`;
    document.getElementById('visibility').textContent = '10 km'; // Default
    document.getElementById('uvIndex').textContent = 'N/A';
    document.getElementById('cloudiness').textContent = `${current.cloud_cover}%`;
    
    // Sun times
    const sunrise = new Date(data.daily.sunrise[0]);
    const sunset = new Date(data.daily.sunset[0]);
    
    document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('sunset').textContent = sunset.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Weather icon
    document.getElementById('weatherIcon').textContent = weatherIcons[weatherCode] || '🌤️';
    
    // Display forecast
    displayForecast(data.daily);
}

function displayForecast(daily) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Show 5 days
    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const fullDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const weatherCode = daily.weather_code[i];
        const icon = weatherIcons[weatherCode] || '🌤️';
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-date">${fullDate}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${maxTemp}°C / ${minTemp}°C</div>
            <div class="forecast-desc">${weatherDescriptions[weatherCode] || 'Unknown'}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    }
}

// ==================== UTILITY FUNCTIONS ====================

function showError(message) {
    errorMessage.textContent = `⚠️ ${message}`;
    errorMessage.classList.add('active');
    
    setTimeout(() => {
        hideError();
    }, 5000);
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

function saveRecentSearch(city) {
    try {
        let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        recentSearches = recentSearches.filter(item => item.toLowerCase() !== city.toLowerCase());
        recentSearches.unshift(city);
        recentSearches = recentSearches.slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } catch (error) {
        console.error('localStorage error:', error);
    }
}

// ==================== NOTIFICATION FUNCTIONS ====================

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

// Update notification button appearance
function updateNotificationButton() {
    if (!notificationBtn) return;
    
    if (Notification.permission === 'granted') {
        notificationBtn.classList.add('enabled');
        notificationStatus.textContent = 'Notifications On';
        notificationBtn.querySelector('i').className = 'fas fa-bell';
    } else if (Notification.permission === 'denied') {
        notificationBtn.classList.remove('enabled');
        notificationStatus.textContent = 'Notifications Blocked';
        notificationBtn.querySelector('i').className = 'fas fa-bell-slash';
    } else {
        notificationBtn.classList.remove('enabled');
        notificationStatus.textContent = 'Enable Notifications';
        notificationBtn.querySelector('i').className = 'fas fa-bell';
    }
}

// Show weather notification
function showWeatherNotification(weatherData, location) {
    if (Notification.permission !== 'granted') {
        return;
    }

    const temp = Math.round(weatherData.current.temperature_2m);
    const weatherCode = weatherData.current.weather_code;
    const condition = weatherDescriptions[weatherCode] || 'Unknown';
    const icon = weatherIcons[weatherCode] || '🌤️';

    const title = `${icon} ${temp}°C in ${location.name}`;
    const body = `${condition}\nFeels like ${Math.round(weatherData.current.apparent_temperature)}°C\nHumidity: ${weatherData.current.relative_humidity_2m}%`;

    try {
        const notification = new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>' + icon + '</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌤️</text></svg>',
            tag: 'weather-update',
            requireInteraction: false,
            silent: false
        });

        // Auto close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Click to focus window
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    } catch (error) {
        console.error('Notification error:', error);
    }
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', async () => {
    // Update notification button status
    updateNotificationButton();
    
    // Request notification permission on load (optional)
    // await requestNotificationPermission();
    
    const lastSearch = localStorage.getItem('lastSearch') || 'London';
    cityInput.value = lastSearch;
    
    setTimeout(() => {
        searchWeather(lastSearch);
    }, 300);
    
    cityInput.focus();
});

window.addEventListener('beforeunload', () => {
    if (cityInput.value) {
        localStorage.setItem('lastSearch', cityInput.value);
    }
});
