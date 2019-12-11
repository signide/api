import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { baseConnectionOptions } from "./connection_options";

let connection: Connection;

before(async () => {
  connection = await createConnection(baseConnectionOptions);
});

after(async () => {
  await connection.close();
});
