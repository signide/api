import request from "supertest";
import faker from "faker/locale/en";
import { expect } from "chai";
import { app } from "../app";
import { query, pool } from "../db/query";
import { deleteUser, createUser, getUser } from "../routes/users/model";
import { getEntry, deleteEntry } from "../routes/entries/model";

const jwtRegex = /^.*\..*\..*$/;
const username = "TESTuser";
const adminUsername = "TESTadmin";
const password = faker.internet.password();
const email = faker.internet.email();

let userToken;
let user;
let entryID;
let adminToken;
let admin;

describe("end-to-end testing", () => {
  before(async () => {
    const result = await query(
      `SELECT * FROM users WHERE username IN ('${username}', '${adminUsername}')`
    );
    result.rows.forEach(async user => await deleteUser(user.id));

    const created = await createUser(
      {
        username: adminUsername,
        password,
        email: faker.internet.email()
      },
      "admin"
    );
    admin = created;
  });

  after(async () => {
    await deleteEntry(entryID);
    await deleteUser(user.id);
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

  it("gets a user", async () => {
    const response = await request(app)
      .get(`/users/${user.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(user.id);
  });

  it("gets user info from the token", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(user.id);
  });

  it("gets all users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body[0]).to.have.property("id");
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

  it("gets all entries", async () => {
    const response = await request(app)
      .get("/entries")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body[0]).to.have.property("id");
  });

  it("gets the user's averages", async () => {
    const response = await request(app)
      .get(`/users/${user.id}/average`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).equal(200);
    expect(response.body).to.have.property("distance");
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
