import { Dictionary } from "../common/utility_types";
import { query } from "../db/query";
import { RequireAtLeastOne } from "../common/utility_types";
import { nest, NestSchema } from "../common/nesting";
import { CityError } from "../common/errors";

const nestSchema: NestSchema = {
  city_id: ["city", "id"],
  country_code: ["city", "country_code"],
  city_name: ["city", "name"],
  user_id: ["user", "id"],
  user_name: ["user", "name"],
  weather_description: ["weather", "description"],
  wind_speed: ["weather", "wind_speed"],
  temp: ["weather", "temperature"],
  humidity: ["weather", "humidity"]
};

interface IAverage {
  speed: number;
  distance: number;
  duration: number;
}

interface IWeather {
  wind?: number;
  temp?: number;
  humidity?: number;
  description?: string;
}

interface BaseEntry {
  id: number;
  userID: number;
  date: Date;
  distance: number;
  duration: number;
  cityID?: string;
  cityName?: string;
  weather?: IWeather;
}

type IEntry = RequireAtLeastOne<BaseEntry, "cityID" | "cityName">;

const cityNameIdMap: Dictionary<string> = {};

export async function getCityIDFromName(name: string): Promise<string> {
  let cityID = cityNameIdMap[name];

  if (cityID == null) {
    const result = await query("SELECT id FROM cities WHERE name = $1", [name]);

    if (result.rows.length === 0) {
      throw new CityError(name);
    }

    const id = result.rows[0].id;
    cityID = id;
    cityNameIdMap[name] = id;
  }

  return cityID;
}

export async function createEntry(entry: IEntry): Promise<IEntry> {
  const text = `
INSERT INTO entries (
  user_id,
  date,
  distance,
  duration,
  created_on,
  city_id,
  wind_speed,
  temp,
  humidity,
  weather_description
)
VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9)
RETURNING *
  `;

  let values = [
    entry.userID,
    entry.date,
    entry.distance,
    entry.duration,
    entry.cityID
  ];

  if (entry.weather) {
    const weather = entry.weather;
    values = values.concat([
      weather.wind,
      weather.temp,
      weather.humidity,
      weather.description
    ]);
  }

  const result = await query(text, values);
  return nest(result.rows[0], nestSchema);
}

export async function getEntry(id: number): Promise<Dictionary<any> | void> {
  const text = `
SELECT
  entries.id,
  entries.user_id,
  entries.date,
  entries.distance,
  entries.duration,
  entries.city_id,
  entries.created_on,
  entries.wind_speed,
  entries.temp,
  entries.humidity,
  entries.weather_description,
  users.username AS user_name,
  cities.name AS city_name,
  cities.country_code AS country_code
FROM 
  entries
INNER JOIN users ON entries.user_id = users.id
INNER JOIN cities ON entries.city_id = cities.id
WHERE
  entries.id = $1;
`;
  const values = [id];
  const result = await query(text, values);
  if (!result.rows[0]) {
    return;
  }
  return nest(result.rows[0], nestSchema);
}

export async function getAverages(userID: number): Promise<IAverage | void> {
  const text = `
SELECT AVG(distance) AS distance, AVG(duration) AS duration
FROM entries WHERE date > NOW()::date - 7
AND user_id = $1;
  `;
  const values = [userID];
  const result = await query(text, values);
  if (result.rows[0] == null) {
    return;
  }

  const distance = Number(result.rows[0].distance);
  const duration = Number(result.rows[0].duration);
  const speed = distance / 1000 / (duration / 3600);
  return {
    distance,
    duration,
    speed
  };
}
