import { query } from "../db/query";
import { createHash } from "../common/hashing";

interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
}

export async function createUser(user: IUser): Promise<IUser> {
  const hash = await createHash(user.password);
  const text = `
INSERT INTO users (username, password, created_on, email)
VALUES ($1, $2, to_timestamp($3 / 1000.0), $4)
RETURNING *
`;
  const values = [user.username, hash, Date.now(), user.email];
  const result = await query(text, values);
  return result.rows[0];
}

export async function getUser(id: number): Promise<IUser> {
  const text = `SELECT * FROM users WHERE id=$1`;
  const values = [id];
  const result = await query(text, values);
  const { password, ...userInfo } = result.rows[0];
  return userInfo;
}
