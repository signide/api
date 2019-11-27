import fetch from "node-fetch";
import { apiKeys } from "../../config/config";
import { CityError } from "../../types/city_error";

interface IWeather {
  wind: number;
  temp: number;
  humidity: number;
  description: string;
}

export async function getWeatherData(id: number): Promise<IWeather> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?appid=${apiKeys.weather}&id=${id}`
  );

  const data = await response.json();
  if (data.cod === "404") {
    throw new CityError(id);
  }

  const result = {
    wind: data.wind?.speed,
    temp: data.main?.temp,
    humidity: data.main?.humidity,
    description: data.weather?.[0].description
  };

  return result;
}
