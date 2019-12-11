import bcrypt from "bcrypt";

const saltRounds = process.env.API_IN_PRODUCTION ? 12 : 8;

export async function createHash(text: string): Promise<string> {
  return await bcrypt.hash(text, saltRounds);
}

export async function compare(text: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(text, hash);
}
