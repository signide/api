import { createConnection } from "typeorm";
import { app } from "./app";
import { apiConfig } from "./config/config";

const { port } = apiConfig;

async function main() {
  await createConnection();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch(err => {
  console.warn(err);
});
