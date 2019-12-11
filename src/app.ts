import "./env";
import express from "express";
import bodyParser from "body-parser";
import winston from "winston";
import expressWinston from "express-winston";
import { userRouter } from "./routes/users/controller";
import { entryRouter } from "./routes/entries/controller";
import { loginRouter } from "./routes/login/controller";

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

function errorHandler(err, req, res, next) {
  console.warn(err);
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ error: err.message });
  }
  res.status(500).send({
    error: "something went wrong"
  });
}

app.use(logger);
app.use(bodyParser.json());
app.use("/login", loginRouter);
app.use("/users", userRouter);
app.use("/entries", entryRouter);
app.use(errorLogger);
app.use(errorHandler);

export { app };
