import { query } from "../db/query";
import { createHash } from "../common/hashing";

interface IUser {
  username: string;
  email: string;
  password: string;
}

export async function createUser(user: IUser): Promise<IUser> {
  const hash = await createHash(user.password);
  try {
    const text = `
INSERT INTO users (username, password, created_on, email)
VALUES ($1, $2, to_timestamp($3 / 1000.0), $4)
RETURNING *
`;
    const values = [user.username, hash, Date.now(), user.email];
    const result = await query(text, values);
    return result.rows[0];
  } catch (err) {
    console.warn(err);
    throw err;
  }
}

export async function getUser(username: string): Promise<IUser> {
  try {
    const text = `SELECT * FROM users WHERE username=$1`;
    const values = [username];
    const result = await query(text, values);
    const { password, id, ...userInfo } = result.rows[0];
    return userInfo;
  } catch (err) {
    console.warn(err);
    throw err;
  }
}
