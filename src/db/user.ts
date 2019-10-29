import { query } from "./query";
import { IUser } from "../users/user.interface";
import { createHash } from "../common/hashing";

export async function store(user: IUser): Promise<IUser> {
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
