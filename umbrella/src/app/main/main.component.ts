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
  public accuracy: number = 0;
  public chanceOfRain: number = 0;
  public accuracyConfidence: string = '';

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
    const current = data.current;
    const forecast = data.forecast.forecastday[0];
   

// Inicialize o score e a confiança
let score = 0;
let confidence = 0;

// Avaliação da umidade (peso: 20%)
const humidity = current.humidity;
if (humidity > 70) score += 20;
else if (humidity > 50) score += 10;

// Avaliação da cobertura de nuvens (peso: 20%)
const cloud = current.cloud;
if (cloud > 75) score += 20;
else if (cloud > 50) score += 10;
else if (cloud > 25) score += 5;

// Avaliação da pressão atmosférica (peso: 30%)
const pressure = current.pressure_mb;
if (pressure < 1000) score += 30;
else if (pressure < 1010) score += 15;

// Avaliação da precipitação atual (peso: 25%)
const precip = current.precip_mm;
if (precip > 0) {
    score = 100; // Se já está chovendo, certeza de "Sim".
    confidence = 95; // Alta confiança diretamente
}

// Avaliação do vento (peso: 5%)
const wind = current.wind_kph;
if (wind > 20) score += 5;
else if (wind > 10) score += 3;

// Calcular a confiança
if (precip === 0) {
    // Contribuição da precipitação
    confidence += 40;

    // Contribuição da pressão
    if (pressure < 1000) confidence += 30;
    else if (pressure < 1010) confidence += 20;
    else confidence += 10;

    // Contribuição da umidade
    if (humidity > 70) confidence += 10;
    else if (humidity > 50) confidence += 5;

    // Contribuição da cobertura de nuvens
    if (cloud > 75) confidence += 10;
    else if (cloud > 50) confidence += 5;

    // Contribuição do vento
    if (wind > 20) confidence += 5;
    else if (wind > 10) confidence += 3;

    // Ajuste final com base no score
    confidence = Math.min(confidence + score / 2, 100); // Limite em 100%
}

// Determina os resultados
this.chanceOfRain = Math.min(score, 100); // Chance de chuva em %
this.willItRain = score > 50 ? 'Sim' : 'Não';
this.accuracyConfidence = confidence.toFixed(0); // Confiabilidade na previsão
}
}