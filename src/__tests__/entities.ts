import { expect } from "chai";
import { User } from "../entities/user";
import { createConnection, Connection, Repository } from "typeorm";
import { baseConnectionOptions } from "./connection_options";

describe("users", () => {
  const userKeys = [
    "username",
    "password",
    "email",
    "createdAt",
    "updatedAt",
    "id",
    "role"
  ];

  let connection: Connection;
  let userRepo: Repository<User>;
  let testUser: User;

  before(async () => {
    connection = await createConnection({ name: "entities", ...baseConnectionOptions });
    userRepo = connection.getRepository(User);
    userRepo.query("TRUNCATE users CASCADE");
  });

  after(async () => {
    userRepo.query("TRUNCATE users CASCADE");
    await connection.close();
  });

  it("creates a user", async () => {
    const fields = {
      username: "!user",
      password: "!pass",
      email: "!test@email.com"
    };
    const user = await userRepo.save(fields);
    expect(user).to.have.keys(userKeys);

    testUser = user;
  });

  it("gets a user", async () => {
    const user = await userRepo.findOne(testUser.id);
    expect(user).to.have.keys(userKeys);
  });

  it("updates a user", async () => {
    const password = "!passnew";
    const user = await userRepo.update({ id: testUser.id }, { password });
    expect(user).to.be.ok;
    expect((await userRepo.findOne(testUser.id)).password).to.equal(password);
  });

  it("deletes a user", async () => {
    const user = await userRepo.delete(testUser.id);
    expect(user).to.be.ok;
    expect(userRepo.findOne(testUser.id)).to.be.empty;
  });
});
