import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { WeatherService } from '../services/weather.service';
import { finalize } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';

interface WeatherData {
  name: string;
  main: {
    temp: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

interface FavoriteLocation {
  name: string;
  weather?: WeatherData | null;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
  searchCity: string = '';
  currentWeather: WeatherData | null = null;
  favorites: FavoriteLocation[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  isLoadingFavorites: boolean = false;

  constructor(
    private toastController: ToastController,
    private weatherService: WeatherService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    // Load favorites when the component initializes
    this.loadFavoritesFromStorage();
  }

  searchWeather() {
    this.errorMessage = null;
    this.currentWeather = null; // Clear previous results
    if (!this.searchCity || !this.searchCity.trim()) {
      this.presentToast('Please enter a city name.');
      return;
    }

    this.isLoading = true;
    const cityToSearch = this.searchCity.trim(); // Use trimmed value

    this.weatherService
      .getWeather(cityToSearch)
      .pipe(
        finalize(() => {
          // This block executes whether the observable completes or errors
          this.isLoading = false;
          console.log('Weather fetch attempt finished.');
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Weather data fetched successfully:', data);
          // Adapt this if your WeatherData interface differs slightly from API response
          this.currentWeather = {
            name: data.name,
            main: { temp: data.main.temp },
            weather: [
              {
                description: data.weather[0]?.description || 'N/A',
                icon: data.weather[0]?.icon || '',
              },
            ],
            wind: { speed: data.wind.speed },
          };
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error fetching weather:', error);
          this.errorMessage =
            error.message || 'Failed to fetch weather data. Please try again.';
          this.currentWeather = null;
        },
      });
  }

  saveFavorite() {
    if (this.currentWeather) {
      const added = this.storageService.addFavorite(this.currentWeather.name);
      if (added) {
        this.presentToast(`${this.currentWeather.name} added to favorites!`);
        this.loadFavoritesFromStorage(); // Reload the list to show the new favorite immediately
      } else {
        this.presentToast(
          `${this.currentWeather.name} is already in favorites.`
        );
      }
    } else {
      this.presentToast('No weather data to save.');
    }
  }

  loadFavoritesFromStorage() {
    console.log('Loading favorites from storage...');
    const favoriteNames = this.storageService.getFavorites();
    this.favorites = favoriteNames.map((name) => ({
      name: name,
      weather: null,
    }));
    console.log('Loaded favorites:', this.favorites);
  }

  removeFavorite(cityName: string, event: Event) {
    event.stopPropagation(); // Prevent item click if wrapped in one
    console.log('Removing favorite:', cityName);
    this.storageService.removeFavorite(cityName);
    this.loadFavoritesFromStorage(); // Refresh the list
    this.presentToast(`${cityName} removed from favorites.`);
  }

  // Helper to show messages
  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom',
    });
    toast.present();
  }
}
