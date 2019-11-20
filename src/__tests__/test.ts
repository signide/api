import request from "supertest";
import faker from "faker/locale/en";
import { app } from "../app";
import { query } from "../db/query";

const jwtRegex = /^.*\..*\..*$/;
const username = "randomUsername12345";
const password = faker.internet.password();
const email = faker.internet.email();
let token: string;
let entryId: string;

afterAll(async () => {
  const selectUser = await query("SELECT id FROM users WHERE username=$1", [
    username
  ]);
  const userId = selectUser.rows[0].id;
  await query("DELETE FROM entries WHERE user_id=$1", [userId]);
  await query("DELETE FROM users WHERE id=$1", [userId]);
});

describe("/users", () => {
  it("creates a user", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        username,
        password,
        email
      });
    expect(response.status).toBe(201);
    expect(response.body.token).toMatch(jwtRegex);
  });

  it("logs a user in", async () => {
    const response = await request(app)
      .post("/login")
      .send({
        username,
        password
      });
    expect(response.status).toBe(201);
    expect(response.body.token).toMatch(jwtRegex);
    token = response.body.token;
  });
});

describe("/entries", () => {
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

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    entryId = response.body.id;
  });

  it("gets an entry", async () => {
    const response = await request(app)
      .get(`/entries/${entryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(entryId);
  });
});
