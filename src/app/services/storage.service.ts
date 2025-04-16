import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly FAVORITES_KEY = 'weatherAppFavorites';

  constructor() { }

  getFavorites(): string[] {
    const favoritesJson = localStorage.getItem(this.FAVORITES_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  }

  saveFavorites(favorites: string[]): void {
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
  }

  addFavorite(city: string): boolean { 
    const favorites = this.getFavorites();
    const normalizedCity = city.toLowerCase(); 
    if (!favorites.map(f => f.toLowerCase()).includes(normalizedCity)) {
      favorites.push(city); 
      this.saveFavorites(favorites);
      return true;
    }
    return false;
  }

  removeFavorite(city: string): void {
     let favorites = this.getFavorites();
     const normalizedCity = city.toLowerCase();
     favorites = favorites.filter(fav => fav.toLowerCase() !== normalizedCity);
     this.saveFavorites(favorites);
  }
}