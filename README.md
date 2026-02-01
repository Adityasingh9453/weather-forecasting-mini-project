# 🌤️ Weather Forecast Website

A beautiful and responsive weather forecasting website that provides real-time weather information and 5-day forecasts for any city in the world.

## 📋 Features

- **Real-time Weather Data**: Get current weather conditions for any city
- **5-Day Forecast**: View upcoming weather predictions
- **Detailed Information**: 
  - Temperature (Celsius)
  - Humidity percentage
  - Wind speed
  - Atmospheric pressure
  - Visibility distance
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern gradient design with smooth animations
- **Weather Icons**: Visual representation of weather conditions
- **Error Handling**: User-friendly error messages for invalid searches
- **Loading Animations**: Visual feedback during data fetching

## 🛠️ Technologies Used

- **HTML5**: Structure and content
- **CSS3**: Styling and animations
- **JavaScript (ES6+)**: Functionality and API integration
- **WeatherAPI**: Real-time weather data provider
- **Font Awesome**: Icon library

## 📁 Project Structure

```
weather-forecast-project/
│
├── index.html          # Main HTML file
├── style.css           # CSS styling file
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## 🚀 Installation & Setup

### Step 1: Download the Files
1. Create a new folder named `weather-forecast-project`
2. Save all four files (index.html, style.css, script.js, README.md) in this folder

### Step 2: File Placement
Make sure all files are in the same directory:
- `index.html`
- `style.css`
- `script.js`
- `README.md`

### Step 3: Run the Project
1. Navigate to your project folder
2. Double-click on `index.html` to open it in your web browser
3. The website will load automatically with London's weather as default

**That's it! No installation, no dependencies, no complex setup required!**

## 💻 Usage

1. **Search for a City**: Type any city name in the search box (e.g., "New York", "Tokyo", "Paris")
2. **Press Enter or Click Search**: Get instant weather results
3. **View Current Weather**: See temperature, conditions, and detailed metrics
4. **Check Forecast**: Scroll down to see the 5-day weather forecast

## 🔑 API Information

This project uses **WeatherAPI** (https://www.weatherapi.com/)
- API Key is already included and configured
- Free tier allows up to 1 million calls per month
- No signup required for basic usage

## 🎨 Customization

### Change Default City
In `script.js`, modify line at the bottom:
```javascript
cityInput.value = 'London';  // Change 'London' to your preferred city
```

### Change Color Scheme
In `style.css`, modify the gradient colors:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Change #667eea and #764ba2 to your preferred colors */
```

### Change Temperature Unit
To display Fahrenheit instead of Celsius, modify in `script.js`:
```javascript
// Change temp_c to temp_f
document.getElementById('temperature').textContent = `${Math.round(data.current.temp_f)}°F`;
```

## 📱 Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 🐛 Troubleshooting

### Weather Data Not Loading?
- Check your internet connection
- Make sure you entered a valid city name
- Try refreshing the page

### Styling Issues?
- Ensure `style.css` is in the same folder as `index.html`
- Clear your browser cache and reload

### API Not Working?
- The API key is already included and should work
- If issues persist, you can get your own free API key from https://www.weatherapi.com/

## 📝 Project Details

- **Version**: 1.0
- **Last Updated**: January 2025
- **License**: Free to use for educational and personal projects

## 🎓 Learning Objectives

This project demonstrates:
- HTML structure and semantic markup
- CSS Grid and Flexbox layouts
- Responsive design principles
- Asynchronous JavaScript (Async/Await)
- API integration and fetch requests
- DOM manipulation
- Error handling
- User input validation

## 🤝 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the code comments in each file
3. Verify all files are correctly placed

## 🌟 Future Enhancements

Possible improvements you could add:
- Hourly weather forecast
- Weather maps integration
- Geolocation for automatic city detection
- Multiple city comparison
- Save favorite cities
- Weather alerts and notifications
- Different language support
- Dark/Light theme toggle

## 📸 Screenshots

The website includes:
- Search bar with gradient button
- Large weather display with emoji icons
- Grid layout for weather details
- 5-day forecast cards with hover effects
- Smooth loading animations
- Responsive mobile layout

---

**Enjoy your Weather Forecast Website! 🌈**