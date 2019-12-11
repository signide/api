import { createConnection } from "typeorm";
import { app } from "./app";

const port = process.env.API_PORT;

async function main() {
  await createConnection();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch(err => {
  console.warn(err);
});
