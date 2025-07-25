/**
 * Features:
 * - Dual-language support (English/Amharic)
 * - Global city search
 * - Robust error handling
 * - Optimized API calls
 */

// ======================
// Configuration Constants
// ======================
const CONFIG = {
    apiKey: "d05bdca7f3e546d5ab8bd3ebee93d8ed",
    apiUrl: "https://api.openweathermap.org/data/2.5/weather",
    iconBaseUrl: "https://cdn-icons-png.flaticon.com/512/"
};

// =================
// DOM Elements Cache
// =================
const DOM = {
    form: document.getElementById('weatherForm'),
    input: document.querySelector('.search-input'),
    temp: document.querySelector('.temperature'),
    city: document.querySelector('.city-name'),
    icon: document.querySelector('.weather-icon'),
    humidity: document.querySelector('.humidity'),
    wind: document.querySelector('.wind-speed'),
    weather: document.querySelector('.weather'),
    error: document.querySelector('.error-message')
};

// ======================
// Ethiopian Cities Database
// ======================
const ETHIOPIAN_CITIES = {
    // Major Cities
    "Addis Ababa": "አዲስ አበባ", "Dire Dawa": "ድሬ ዳዋ", "Adama": "አዳማ",
    "Gondar": "ጎንደር", "Bahir Dar": "ባህር ዳር", "Mekelle": "መቀሌ",

    // Regional Capitals
    "Hawassa": "አዋሳ", "Jimma": "ጅማ", "Jijiga": "ጅጅጋ",
    "Shashamane": "ሻሸመኔ", "Arba Minch": "አርባ ምንጭ",

    // Additional Cities
    "Harar": "ሐረር", "Dessie": "ደሴ", "Asella": "አሰላ",
    "Debre Markos": "ደብረ ማርቆስ", "Nekemte": "ነቀምት"
};

// ======================
// Weather Icons Mapping
// ======================
const WEATHER_ICONS = {
    "Clear": "3222/3222807.png",
    "Clouds": "1146/1146869.png",
    "Rain": "1163/1163657.png",
    "Drizzle": "3076/3076129.png",
    "Thunderstorm": "590/590975.png",
    "Snow": "2315/2315309.png",
    "Mist": "4005/4005901.png",
    "Default": "3222/3222807.png"
};

// ======================
// Core Functions
// ======================

/**
 * Converts Amharic city names to English for API calls
 * @param {string} city - City name in any language
 * @returns {string} English city name
 */
const convertToEnglish = (city) =>
    Object.entries(ETHIOPIAN_CITIES).find(([_, amh]) => city === amh)?.[0] || city;

/**
 * Gets the appropriate weather icon URL
 * @param {Object} weatherData - API response data
 * @returns {string} Complete icon URL
 */
const getWeatherIcon = ({ weather: [{ main }] }) =>
    `${CONFIG.iconBaseUrl}${WEATHER_ICONS[main] || WEATHER_ICONS.Default}`;

/**
 * Updates UI with weather data
 * @param {Object} data - API response data
 */
const updateUI = (data) => {
    const { main, wind, name } = data;
    const englishCity = convertToEnglish(name);

    DOM.temp.textContent = `${Math.round(main.temp)}°C`;
    DOM.city.textContent = ETHIOPIAN_CITIES[englishCity] || name;
    DOM.icon.src = getWeatherIcon(data);
    DOM.humidity.textContent = `${main.humidity}%`;
    DOM.wind.textContent = `${wind.speed} km/h`;

    DOM.weather.style.display = 'block';
    DOM.error.style.display = 'none';
};

/**
 * Handles API errors and displays user-friendly messages
 * @param {Error} error - Error object
 * @param {string} city - Original city name
 */
const handleError = (error, city) => {
    console.error('API Error:', error);

    const isEthiopianCity = Object.values(ETHIOPIAN_CITIES).includes(city) ||
        ETHIOPIAN_CITIES[city];

    const message = isEthiopianCity
        ? `"${city}" not found in Ethiopia`
        : `"${city}" not found globally`;

    DOM.error.innerHTML = `<p class="error-text">${message}</p>`;
    DOM.error.style.display = 'block';
    DOM.weather.style.display = 'none';
};

/**
 * Fetches weather data from API
 * @param {string} city - City name to search
 */
const fetchWeather = async (city) => {
    try {
        const englishCity = convertToEnglish(city);
        const isEthiopian = ETHIOPIAN_CITIES[englishCity];
        const query = `${encodeURIComponent(englishCity)}${isEthiopian ? ',ET' : ''}`;

        const response = await fetch(
            `${CONFIG.apiUrl}?q=${query}&units=metric&appid=${CONFIG.apiKey}`
        );

        const data = await response.json();
        if (data.cod !== 200) throw new Error(data.message);

        updateUI(data);
    } catch (error) {
        handleError(error, city);
    }
};

// ======================
// Event Listeners
// ======================
DOM.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = DOM.input.value.trim();
    if (city) fetchWeather(city);
});

// Initialize with default city
fetchWeather("Addis Ababa");