import express from "express";
import bodyParser from "body-parser";
import winston from "winston";
import expressWinston from "express-winston";
import { apiConfig } from "./config/config";
import { userRouter } from "./users/controller";
import { entryRouter } from "./entries/controller";

const app = express();

const logger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.json(),
  meta: true,
  msg: "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}",
  expressFormat: true
});

const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.json()
});

function tokenHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    console.warn(err);
    res.status(401).send({ error: err.message });
  }
  next();
}

app.use(logger);
app.use(bodyParser.json());
app.use("/users", userRouter);
app.use("/entries", entryRouter);
app.use(tokenHandler);
app.use(errorLogger);

const { port } = apiConfig;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
