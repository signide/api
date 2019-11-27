import request from "supertest";
import faker from "faker/locale/en";
import { expect } from "chai";
import { app } from "../app";
import { query, pool } from "../db/query";
import {
  IUser,
  getUserByName,
  deleteUser,
  createUser
} from "../routes/users/model";

const jwtRegex = /^.*\..*\..*$/;
const username = "randomUsername12345";
const password = faker.internet.password();
const email = faker.internet.email();
let token: string;
let entryId: string;
let adminToken: string;
let admin: IUser;

describe("end-to-end testing", () => {
  before(async () => {
    const user = await createUser(
      {
        username: "!@#admin",
        password,
        email: faker.internet.email()
      },
      "admin"
    );
    admin = user;
  });

  after(async () => {
    const user = await getUserByName(username);
    if (!user) {
      return;
    }
    const userID = user.id;
    await query("DELETE FROM entries WHERE user_id=$1", [userID]);
    await deleteUser(userID);
    await deleteUser(admin.id);
    await pool.end();
  });

  it("creates a user", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        username,
        password,
        email
      });
    expect(response.status).equal(201);
    token = response.body.token;
    expect(token).match(jwtRegex);
  });

  it("logs a user in", async () => {
    const response = await request(app)
      .post("/login")
      .send({
        username: admin.username,
        password
      });

    expect(response.status).equal(201);
    adminToken = response.body.token;
    expect(adminToken).match(jwtRegex);
  });

  it("creates an entry", async () => {
    const entry = {
      date: new Date().toISOString(),
      duration: faker.random.number(),
      distance: faker.random.number(),
      cityName: "Tokyo"
    };

    const response = await request(app)
      .post("/entries")
      .set("Authorization", `Bearer ${token}`)
      .send(entry);

    expect(response.status).equal(201);
    expect(response.body).to.have.property("id");
    entryId = response.body.id;
  });

  it("gets an entry", async () => {
    const response = await request(app)
      .get(`/entries/${entryId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(entryId);
  });
});
