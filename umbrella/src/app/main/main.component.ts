import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  private apiKey: string = '388a669a8b574f9ca3011722251501'; 
  private apiUrl: string = 'http://api.weatherapi.com/v1/forecast.json';
  private ipInfoToken: string = '2b82bf8f99ea6c';
  public willItRain: string = '';
  public location: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getIpInfo().pipe(
      switchMap((location: string) => this.getWeather(location))
    ).subscribe(
      (response: any) => {
        this.checkRain(response);
      },
      (error) => {
        console.error('Erro ao fazer a requisição:', error);
      }
    );
  }

  getIpInfo() {
    const url = `https://ipinfo.io/json?token=${this.ipInfoToken}`;
    return this.http.get(url).pipe(
      switchMap((response: any) => {
        this.location = response.city;
        console.log(this.location);
        return [this.location];
      })
    );
  }

  getWeather(location: string) {
    const params = {
      key: this.apiKey,
      q: location,
      lang: 'pt'
    };

    return this.http.get(this.apiUrl, { params });
  }

  checkRain(data: any): void {
    const forecast = data.forecast.forecastday[0];
    this.willItRain = forecast.day.daily_will_it_rain ? 'Sim' : 'Não';
  }
}