import express from "express";
import bodyParser from "body-parser";
import winston from "winston";
import expressWinston from "express-winston";
import { userRouter } from "./users/user.controller";

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

app.use(logger);
app.use(bodyParser.json());
app.use("/users", userRouter);
app.use(errorLogger);

const port = 4000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
