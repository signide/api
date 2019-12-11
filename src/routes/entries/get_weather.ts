import fetch from "node-fetch";
import { apiKeys } from "../../config/config";
import { CityError } from "../../types/city_error";

interface WeatherInfo {
  windSpeed: number;
  temp: number;
  humidity: number;
  weatherDescription: string;
}

export async function getWeatherData(id: number | string): Promise<WeatherInfo> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?appid=${apiKeys.weather}&id=${id}`
  );

  const data = await response.json();
  if (data.cod === "404") {
    throw new CityError(id);
  }

  const result = {
    windSpeed: data.wind?.speed,
    temp: data.main?.temp,
    humidity: data.main?.humidity,
    weatherDescription: data.weather?.[0].description
  };

  return result;
}
