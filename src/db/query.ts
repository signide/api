import { Pool, QueryResult } from "pg";
import { postgresConfig } from "../config/config";

export const pool = new Pool(postgresConfig);

export async function query(
  text: string,
  params?: any[]
): Promise<QueryResult<any>> {
  return await pool.query(text, params);
}
