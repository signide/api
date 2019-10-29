import { postgresConfig } from "../config/config";
import { Pool, QueryResult } from "pg";

const pool = new Pool(postgresConfig);

export async function query(
  text: string,
  params: any[]
): Promise<QueryResult<any>> {
  return await pool.query(text, params);
}
