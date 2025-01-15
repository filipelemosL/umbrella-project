import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  private apiKey: string = '388a669a8b574f9ca3011722251501'; // Substitua pela sua chave de API
  private apiUrl: string = 'http://api.weatherapi.com/v1/forecast.json';
  public willItRain: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getWeather();
  }

  getWeather(): void {
    const params = {
      key: this.apiKey,
      q: 'seattle',
      lang: 'pt'
    };

    this.http.get(this.apiUrl, { params }).subscribe(
      (response: any) => {
        console.log(response);
        this.checkRain(response);
      },
      (error) => {
        console.error('Erro ao fazer a requisição:', error);
      }
    );
  }

  checkRain(data: any): void {
    const forecast = data.forecast.forecastday[0];
    this.willItRain = forecast.day.daily_will_it_rain ? 'Sim' : 'Não';
  }

}