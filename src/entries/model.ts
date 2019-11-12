import { Dictionary } from "../common/utility_types";
import { query } from "../db/query";
import { RequireAtLeastOne } from "../common/utility_types";
import { nest } from "../common/nesting";

interface BaseEntry {
  id: number;
  userID: number;
  date: Date;
  distance: number;
  duration: number;
  cityID?: number;
  cityName?: string;
}

type IEntry = RequireAtLeastOne<BaseEntry, "cityID" | "cityName">;

const cityNameIdMap: Map<string, number> = new Map();

export async function createEntry(entry: IEntry): Promise<IEntry> {
  let cityID = entry.cityID || cityNameIdMap.get(entry.cityName);
  if (cityID == null) {
    const result = await query("SELECT * FROM cities WHERE name = $1", [
      entry.cityName
    ]);

    if (result.rows.length === 0) {
      throw new Error(`city ${entry.cityName} is unknown`);
    }

    const id = result.rows[0].id;
    cityID = id;
    cityNameIdMap.set(entry.cityName, id);
  }

  const text = `
INSERT INTO entries (user_id, date, distance, duration, city_id, created_on)
VALUES ($1, $2, $3, $4, $5, to_timestamp($6 / 1000.0))
RETURNING *
  `;

  const values = [
    entry.userID,
    entry.date,
    entry.distance,
    entry.duration,
    cityID,
    Date.now()
  ];

  const result = await query(text, values);
  return nest(result.rows[0], ["user", "city"]);
}

export async function getEntry(id: number): Promise<Dictionary<any> | void> {
  const text = `
SELECT
  entries.id,
  entries.user_id,
  users.username AS user_name,
  entries.date,
  entries.distance,
  entries.duration,
  entries.city_id,
  cities.name AS city_name,
  cities.country_code AS city_country_code,
  entries.created_on
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
  return nest(result.rows[0], ["user", "city"]);
}