import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = environment.openWeather.apiKey;
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) {
     if (!this.apiKey || this.apiKey === 'YOUR_API_KEY') {
         console.warn("OpenWeatherMap API Key is not set correctly in src/environments/environment.ts or environment.prod.ts!");
         alert("Please set your OpenWeatherMap API key in the environment files (src/environments/).");
     }
  }

  getWeather(city: string): Observable<any> {
    const url = `${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
  
    console.log('Fetching weather from:', url);
  
    return this.http.get<any>(url).pipe(
      tap(data => console.log('Weather data received:', data)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`; 
    } else {
      if (error.status === 401) {
        errorMessage = `API key error (Unauthorized). Please check the apiKey in your environment file. (${error.status})`; // Keep this clean
      } else if (error.status === 404) {
        errorMessage = `City not found: ${error.error?.message || 'Please check the spelling.'} (${error.status})`;
      } else {
        errorMessage = `Server error: ${error.status}, ${error.message}`; 
      }
    }
    console.error('API Error Details:', error);
    return throwError(() => new Error(errorMessage));
  }
}