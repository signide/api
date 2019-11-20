import { apiConfig } from "./config/config";
import { app } from "./app";

const { port } = apiConfig;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
