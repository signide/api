import dotenv from "dotenv";
import request from "supertest";
import sinon from "sinon";
import faker from "faker/locale/en";
import { expect } from "chai";
import { app } from "../app";
import { getRepository, Repository, createConnection, Connection } from "typeorm";
import { Entry } from "../entities/entry";
import { User } from "../entities/user";
import { mockModule } from "./helpers";
import * as weather from "../routes/entries/get_weather";
import { createHash } from "../utility/hashing";

const jwtRegex = /^.*\..*\..*$/;
const username = "TESTuser";
const adminUsername = "TESTadmin";
const password = faker.internet.password();
const email = faker.internet.email();

let user: User;
let admin: User;
let userToken: string;
let adminToken: string;
let entryId: string;

let connection: Connection;
let userRepo: Repository<User>;
let entryRepo: Repository<Entry>;

before(async () => {
  dotenv.config();
  connection = await createConnection({
    type: "postgres",
    host: process.env.TYPEORM_HOST,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TEST_DATABASE,
    entities: ["src/entities/*.ts", "dist/entities/*.js"]
  });
  userRepo = getRepository(User);
  entryRepo = getRepository(Entry);
  entryRepo.query("TRUNCATE entries CASCADE");
  userRepo.query("TRUNCATE users CASCADE");

  admin = await userRepo.save({
    username: adminUsername,
    password: await createHash(password),
    email: faker.internet.email(),
    role: "admin"
  });
});

after(async () => {
  const userRepo = getRepository(User);
  const entryRepo = getRepository(Entry);
  await entryRepo.delete(entryId);
  await userRepo.delete(user.id);
  await userRepo.delete(admin.id);
  await connection.close();
});

describe("end-to-end testing", () => {
  const mockWeather = mockModule(weather, {
    getWeatherData: async id => {
      return {
        windSpeed: 1,
        temp: 2,
        humidity: 3,
        weatherDescription: "banana"
      };
    }
  });

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sinon.restore();
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
    expect(response.body.updatedAt).to.not.equal(response.body.createdAt);
  });

  it("creates an entry", async () => {
    mockWeather(sandbox);

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
    entryId = response.body.id;
  });

  it("gets an entry", async () => {
    const response = await request(app)
      .get(`/entries/${entryId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(entryId);
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
      .delete(`/entries/${entryId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(entryId);
    expect(await entryRepo.findOne(entryId)).to.be.undefined;
  });

  it("deletes the user", async () => {
    const response = await request(app)
      .delete(`/users/${user.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).equal(200);
    expect(response.body.id).equal(user.id);
    expect(await entryRepo.findOne(user.id)).to.be.undefined;
  });
});
