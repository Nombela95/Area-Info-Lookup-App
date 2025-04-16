import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular'; 
import { WeatherService } from '../services/weather.service';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs/operators';

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
  imports: [IonicModule, CommonModule, FormsModule] 
})
export class HomePage implements OnInit {

  searchCity: string = ''; 
  currentWeather: WeatherData | null = null;
  favorites: FavoriteLocation[] = []; 
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private toastController: ToastController,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    // Load favorites when the component initializes
    this.loadFavorites();
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

    this.weatherService.getWeather(cityToSearch)
      .pipe(
        finalize(() => { // This block executes whether the observable completes or errors
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
              weather: [{ description: data.weather[0]?.description || 'N/A', icon: data.weather[0]?.icon || '' }],
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

  saveFavorite() {
    if (this.currentWeather) {
      console.log('Save favorite button clicked for:', this.currentWeather.name);
      // Saving logic will go here later
    }
  }

  loadFavorites() {
     console.log('Loading favorites...');
     // Loading from localStorage will go here later
     // Mock data for now:
     // this.favorites = [{name: 'London'}, {name: 'Tokyo'}];
  }

   // Helper to show messages
   async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom'
    });
    toast.present();
  }

}
