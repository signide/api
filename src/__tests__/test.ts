import request from "supertest";
import faker from "faker/locale/en";
import { expect } from "chai";
import { app } from "../app";
import { query, pool } from "../db/query";
import {
  getUserByName,
  deleteUser,
  createUser,
  getUser
} from "../routes/users/model";
import { getEntry } from "../routes/entries/model";

const jwtRegex = /^.*\..*\..*$/;
const username = "randomUsername12345";
const password = faker.internet.password();
const email = faker.internet.email();
let userToken;
let user;
let entryID;
let adminToken;
let admin;

describe("end-to-end testing", () => {
  before(async () => {
    const created = await createUser(
      {
        username: "!@#admin",
        password,
        email: faker.internet.email()
      },
      "admin"
    );
    admin = created;
  });

  after(async () => {
    const selected = await getUserByName(username);
    if (!selected) {
      return;
    }
    const userID = selected.id;
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
    user = response.body.user;
    userToken = response.body.token;
    expect(userToken).match(jwtRegex);
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

  it("changes the user's password", async () => {
    const response = await request(app)
      .patch(`/users/${user.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        oldPassword: password,
        password: "bananananana"
      });

    expect(response.status).equal(200);
    expect(new Date(response.body.updated_on)).above(
      new Date(response.body.created_on)
    );
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
      .set("Authorization", `Bearer ${adminToken}`)
      .send(entry);

    expect(response.status).equal(201);
    expect(response.body).to.have.property("id");
    entryID = response.body.id;
  });

  it("gets an entry", async () => {
    const response = await request(app)
      .get(`/entries/${entryID}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(entryID);
  });

  it("deletes an entry", async () => {
    const response = await request(app)
      .delete(`/entries/${entryID}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(entryID);
    expect(await getEntry(entryID)).to.be.undefined;
  });

  it("deletes the user", async () => {
    const response = await request(app)
      .delete(`/users/${user.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(user.id);
    expect(await getUser(user.id)).to.be.undefined;
  });
});
