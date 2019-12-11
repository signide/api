import { expect } from "chai";
import { Pool, QueryResult } from "pg";
import { postgresConfig } from "../config/config";
import { User } from "../entities/user";
import { createConnection, Connection, Repository } from "typeorm";
import { baseConnectionOptions } from "./connection_options";

const testPool = new Pool({
  ...postgresConfig,
  database: "api_test"
});

async function query(text: string, params?: any[]): Promise<QueryResult<any>> {
  return await testPool.query(text, params);
}

const userKeys = [
  "username",
  "password",
  "email",
  "createdAt",
  "updatedAt",
  "id",
  "role"
];

describe("users", () => {
  let connection: Connection;
  let userRepository: Repository<User>;
  let testUser: User;

  before(async () => {
    await query("DELETE FROM users WHERE username='!user'");
    connection = await createConnection({ name: "entities", ...baseConnectionOptions });
    userRepository = connection.getRepository(User);
  });

  after(async () => {
    await query("DELETE FROM users WHERE username='!user'");
    await testPool.end();
    await connection.close();
  });

  it("creates a user", async () => {
    const fields = {
      username: "!user",
      password: "!pass",
      email: "!test@email.com"
    };
    const user = await userRepository.save(fields);
    expect(user).to.have.keys(userKeys);

    testUser = user;
  });

  it("gets a user", async () => {
    const user = await userRepository.findOne(testUser.id);
    expect(user).to.have.keys(userKeys);
  });

  it("updates a user", async () => {
    const password = "!passnew";
    const user = await userRepository.update({ id: testUser.id }, { password });
    expect(user).to.be.ok;
    expect((await userRepository.findOne(testUser.id)).password).to.equal(password);
  });

  it("deletes a user", async () => {
    const user = await userRepository.delete(testUser.id);
    expect(user).to.be.ok;
    expect(userRepository.findOne(testUser.id)).to.be.empty;
  });
});
