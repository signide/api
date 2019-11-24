import { query } from "../../db/query";
import { createHash } from "../../utility/hashing";
import { without } from "../../utility/without";

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
}

export type Role = "regular" | "manager" | "admin";

export async function createUser(
  user: Omit<IUser, "id" | "role">,
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

const fields = ["id", "username", "password", "email", "created_on", "role"];
const baseQuery = `SELECT ${fields.join(", ")} FROM users`;
const passwordlessQuery = `
SELECT ${without(fields, ["password"]).join(", ")} FROM users
`;

export async function getUsers(
  excludePassword: boolean = true
): Promise<Omit<IUser, "password">[] | void> {
  const result = await query(excludePassword ? passwordlessQuery : baseQuery);
  return result.rows;
}

export async function getUser(id: number): Promise<IUser | void> {
  const text = `${baseQuery} WHERE id = $1`;
  const values = [id];
  const result = await query(text, values);
  return result.rows[0];
}

export async function getUserByName(name: string): Promise<IUser | void> {
  const text = `${baseQuery} WHERE username = $1`;
  const values = [name];
  const result = await query(text, values);
  return result.rows[0];
}

export async function updateUser(
  userID: number,
  toUpdate: Partial<Omit<IUser, "id">>
): Promise<IUser | void> {
  const entries = Object.entries(toUpdate);
  if (entries.length === 0) {
    return;
  }

  const fields = [];
  const values: any[] = [userID];
  entries.forEach((entry, index) => {
    const [key, value] = entry;
    fields.push(`${key} = $${index + 2}`);
    values.push(value);
  });

  const text = `
UPDATE users SET updated_on = NOW(), ${fields.join(", ")}
WHERE id = $1
RETURNING *
  `;
  const result = await query(text, values);
  return result.rows[0];
}

export async function deleteUser(id: number): Promise<IUser | void> {
  const text = "DELETE FROM users WHERE id = $1 RETURNING *";
  const values = [id];
  const result = await query(text, values);
  return result.rows[0];
}
