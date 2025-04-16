import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular'; // Import ToastController

// Define interfaces for cleaner code (optional but recommended)
interface WeatherData {
  name: string;
  main: {
    temp: number;
  };
  weather: {
    description: string;
    icon: string; // We might use this later
  }[];
  wind: {
    speed: number;
  };
}

interface FavoriteLocation {
    name: string;
    weather?: WeatherData | null; // To store weather later
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule] // Add CommonModule and FormsModule
})
export class HomePage implements OnInit {

  searchCity: string = ''; // Will bind to input later
  currentWeather: WeatherData | null = null;
  favorites: FavoriteLocation[] = []; // Will hold favorite cities
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private toastController: ToastController) {} // Inject ToastController

  ngOnInit() {
    // Load favorites when the component initializes
    this.loadFavorites();
  }

  searchWeather() {
    console.log('Search button clicked. City:', this.searchCity);
    // API call logic will go here in the next step
    this.errorMessage = null; // Reset error on new search
    this.currentWeather = null; // Clear previous results
     if (!this.searchCity.trim()) {
         this.presentToast('Please enter a city name.');
         return;
     }
     // Mock loading state for now
     this.isLoading = true;
     setTimeout(() => { // Simulate API call delay
         this.isLoading = false;
         console.log('Simulated API call finished.');
          // Mock error for testing
          // this.errorMessage = 'Could not fetch weather data.';
          // Mock success for testing
          // this.currentWeather = { name: this.searchCity, main: { temp: 25 }, weather: [{ description: 'clear sky', icon: '01d' }], wind: { speed: 3.5 } };
     }, 1500);
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
