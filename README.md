# 🌍 Area-Info-Lookup-App
Area-Info-Lookup-App is a cross-platform weather application built with Angular and Ionic framework. It allows users to view real-time weather information for any city and manage a list of favorite cities for quick access.

## 🎯 Objective

Build a one-page Ionic + Angular application that allows users to:
- Enter a city/area name (e.g. "Johannesburg")
- Fetch and display weather data using the OpenWeatherMap API
- Save selected locations to a Favorites list
- Persist saved locations using `localStorage`

## ✅ Features

1. **User Input & API Call**
   - Text input field for city or area name
   - Submit button triggers API call to:
     ```
     https://api.openweathermap.org/data/2.5/weather?q={city}&appid=YOUR_API_KEY&units=metric
     ```

2. **Display Results**
   - City name
   - Temperature (°C)
   - Weather condition
   - Wind speed

3. **Save to Favorites**
   - "Save to Favorites" button
   - Stores selected city in `localStorage`

4. **Favorites List**
   - Displays saved cities
   - Fetches and displays updated weather info
   - Persists data using `localStorage`

## 🛠️ Built With

- [Angular](https://angular.io/)
- [Ionic Framework](https://ionicframework.com/)
- [OpenWeatherMap API](https://openweathermap.org/api) for real-time weather data

## 📦 Installation

Clone the repository:
```
git clone https://github.com/Nombela95/Area-Info-Lookup-App
```
## Intstall dependencies
```
npm install
```
## Run the application:
```
ionic serve
```

## 🙋‍♀️ Developer
Andiswa Nombela
GitHub: https://github.com/Nombela95/
GitLab: https://gitlab.com/RomanNombela/
LinkedIn: https://www.linkedin.com/in/andiswa-nombela-64865a168/