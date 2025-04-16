import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { WeatherService } from '../services/weather.service';
import { catchError, finalize } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { forkJoin, Observable, of } from 'rxjs';

// Defines the structure for expected weather data from the API (or tailored subset)
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

// Defines the structure for storing favorite locations, including optional fetched weather
interface FavoriteLocation {
    name: string;
    weather: WeatherData | null; 
}


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  searchCity: string = '';
  currentWeather: WeatherData | null = null; 
  favorites: FavoriteLocation[] = []; 
  isLoading: boolean = false; 
  errorMessage: string | null = null;
  isLoadingFavorites: boolean = false; 
  isNaN = Number.isNaN;

  /**
   * Constructs the HomePage component.
   * @param toastController Service to display simple feedback messages (toasts).
   * @param weatherService Service to fetch weather data from the API.
   * @param storageService Service to manage storing and retrieving favorites from localStorage.
   */
  constructor(
    private toastController: ToastController,
    private weatherService: WeatherService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.loadFavoritesFromStorage();
  }

  /**
   * Fetches weather data for the city entered in the search input.
   * Handles input validation, loading states, and updates component properties
   * with the fetched data or an error message.
   */
  searchWeather() {
    this.errorMessage = null;
    this.currentWeather = null;
    if (!this.searchCity || !this.searchCity.trim()) {
      this.presentToast('Please enter a city name.');
      return;
    }

    this.isLoading = true;
    const cityToSearch = this.searchCity.trim();

    this.weatherService.getWeather(cityToSearch)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Weather fetch attempt finished.');
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Weather data fetched successfully:', data);
          // Map API response to our WeatherData interface
          this.currentWeather = {
              name: data.name,
              main: { temp: data.main.temp, humidity: data.main.humidity },
              // weather: [{ main: 'Error', description: `Error: ${result.message?.substring(0,30) || 'Failed to load'}...`, icon: '' }],

              weather: [{ main: 'Error', description: data.weather[0]?.description || 'N/A', icon: data.weather[0]?.icon || '' }],
              wind: { speed: data.wind.speed }
          };
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error fetching weather:', error);
          this.errorMessage = error.message || 'Failed to fetch weather data. Please try again.';
          this.currentWeather = null;
        }
      });
  }

  /**
   * Saves the currently displayed city weather to the favorites list in localStorage.
   * Updates the favorites list displayed on the page.
   * Shows a confirmation toast or a message if the city is already saved.
   */
  saveFavorite() {
    if (this.currentWeather) {
      const added = this.storageService.addFavorite(this.currentWeather.name);
      if (added) {
           this.presentToast(`${this.currentWeather.name} added to favorites!`);
           this.loadFavoritesFromStorage(); // Refresh the list and fetch weather
      } else {
           this.presentToast(`${this.currentWeather.name} is already in favorites.`);
      }
    } else {
      this.presentToast('No current weather data available to save.');
    }
  }

  /**
   * Loads the list of favorite city names from storage.
   * Maps the names to the FavoriteLocation structure (initially without weather data).
   * Triggers fetching the current weather for these loaded favorites.
   */
  loadFavoritesFromStorage() {
    console.log('Loading favorites from storage...');
    const favoriteNames = this.storageService.getFavorites();
    // Initialize favorites list with names, weather set to null initially
    this.favorites = favoriteNames.map(name => ({ name: name, weather: null }));
    console.log('Loaded favorite names:', this.favorites.map(f => f.name));
    this.fetchWeatherForFavorites(); 
  }

 /**
  * Fetches current weather data for all cities currently in the favorites list.
  * Uses forkJoin to run API requests in parallel.
  * Updates the 'weather' property of each item in the `favorites` array with
  * the fetched data or an error state placeholder.
  * Handles the loading state for the favorites section.
  */
 fetchWeatherForFavorites() {
   if (this.favorites.length === 0) {
       return;
   }

   this.isLoadingFavorites = true;
   console.log('Fetching weather for all favorites...');

   // Create an array of weather fetching Observables, one for each favorite
   const weatherObservables: Observable<any>[] = this.favorites.map(fav =>
       this.weatherService.getWeather(fav.name).pipe(
           catchError(error => {
               // If fetching for one city fails, log the error and return an error marker object
               console.error(`Failed to fetch weather for ${fav.name}:`, error);
               return of({ error: true, name: fav.name, message: error.message });
           })
       )
   );

   // Execute all weather requests in parallel and wait for all to complete
   forkJoin(weatherObservables)
     .pipe(
         finalize(() => {
             // Ensure loading indicator is turned off regardless of success/failure
             this.isLoadingFavorites = false;
             console.log('Finished fetching weather for all favorites.');
         })
     )
     .subscribe(results => {
         console.log('Weather results for favorites:', results);
         // Process the results for each favorite
         this.favorites.forEach((fav, index) => {
             const result = results[index];
             if (result && !result.error) {
                 // Successfully fetched weather: map to WeatherData and update the favorite item
                 fav.weather = {
                     name: result.name,
                     main: { temp: result.main.temp, humidity: result.main.humidity  },
                     weather: [{  main: 'Error', description: result.weather[0]?.description || 'N/A', icon: result.weather[0]?.icon || '' }],
                     wind: { speed: result.wind.speed }
                 };
             } else if (result && result.error) {
                 // Fetching failed for this city: set an error state placeholder in fav.weather
                 console.warn(`Could not load weather for ${fav.name}: ${result.message}`);
                 // Create a placeholder to indicate error in the UI (using NaN for temp as a flag)
                 fav.weather = {
                     name: fav.name,
                     main: {temp: NaN, humidity: NaN},
                     weather: [{ main: 'Error', description: `Error: ${result.message?.substring(0,30) || 'Failed to load'}...`, icon: ''}],
                     wind: {speed: NaN}
                 };
             }
         });
     });
 }

 /**
  * Removes a specified city from the favorites list.
  * @param cityName The name of the city to remove.
  * @param event The click event object, used to stop propagation if necessary.
  */
 removeFavorite(cityName: string, event: Event) {
   event.stopPropagation(); // Prevent potential parent element clicks
   console.log('Removing favorite:', cityName);
   this.storageService.removeFavorite(cityName); // Remove from storage
   this.loadFavoritesFromStorage(); // Refresh the list from storage
   this.presentToast(`${cityName} removed from favorites.`); // Show confirmation
 }


  /**
   * Utility method to display a simple toast message at the bottom of the screen.
   * @param message The text message to display in the toast.
   * @param duration Optional duration in milliseconds (default: 2000ms).
   */
  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom' // Other options: 'top', 'middle'
    });
    toast.present();
  }

  // Weather card class based on condition
getWeatherCardClass(weatherMain: string): string {
  const weather = weatherMain.toLowerCase();
  if (weather.includes('rain')) return 'rainy-card';
  if (weather.includes('cloud')) return 'cloudy-card';
  if (weather.includes('thunder') || weather.includes('storm')) return 'thunder-card';
  return 'sunny-card'; // default for clear/sunny
}

// Weather icon mapping
getWeatherIcon(condition: string | undefined): string {
  if (!condition) return 'help-circle-outline'; // default or fallback icon
  switch (condition.toLowerCase()) {
    case 'clear': return 'sunny-outline';
    case 'clouds': return 'cloud-outline';
    case 'rain': return 'rainy-outline';
    case 'snow': return 'snow-outline';
    case 'thunderstorm': return 'thunderstorm-outline';
    case 'drizzle': return 'rainy-outline';
    case 'mist':
    case 'haze':
    case 'fog': return 'partly-sunny-outline';
    default: return 'cloudy-outline';
  }
}


// Weather color for icons
getWeatherColor(condition?: string): string {
  if (!condition) return 'medium';
  const weather = condition.toLowerCase();
  if (weather.includes('rain')) return 'primary';
  if (weather.includes('cloud')) return 'medium';
  if (weather.includes('thunder') || weather.includes('storm')) return 'warning';
  return 'warning'; // sunny/clear
}

// Refresh weather and favorites
  refreshWeather() {
    if (this.searchCity?.trim()) {
      this.searchWeather(); // Reuse the existing method to fetch current city weather
    }

    this.loadFavoritesFromStorage(); // Refresh favorites data as well
  }
}