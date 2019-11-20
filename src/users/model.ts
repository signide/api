import { query } from "../db/query";
import { createHash } from "../common/hashing";

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
}

type Role = "regular" | "manager" | "admin";

export async function createUser(
  user: IUser,
  role: Role = "regular"
): Promise<IUser> {
  const hash = await createHash(user.password);
  const text = `
INSERT INTO users (username, password, created_on, email, role)
VALUES ($1, $2, NOW(), $3, $4)
RETURNING *
`;
  const values = [user.username, hash, user.email, role];
  const result = await query(text, values);
  return result.rows[0];
}

export async function getUser(id: number): Promise<IUser | void> {
  const text = `
SELECT id, username, password, email, created_on, role
FROM users WHERE id=$1
`;
  const values = [id];
  const result = await query(text, values);
  return result.rows[0];
}

export async function getUserByName(name: string): Promise<IUser | void> {
  const text = `
SELECT id, username, password, email, created_on, role
FROM users WHERE username=$1
`;
  const values = [name];
  const result = await query(text, values);
  return result.rows[0];
}
