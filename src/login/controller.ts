import express from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/config";
import { getUserByName } from "../users/model";
import { compare } from "../common/hashing";

const { secret } = jwtConfig;
export const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  const user = await getUserByName(req.body.username);
  if (!user) {
    return res.status(404).send({
      error: `user "${req.body.username}" not found`
    });
  }

  const { id, username, password } = user;
  const isMatch = await compare(req.body.password, password);
  if (!isMatch) {
    return res.status(401).send({
      error: `incorrect password`
    });
  }

  const token = jwt.sign({ id, username }, secret, {
    expiresIn: 86400
  });
  res.status(201).send({ auth: true, token });
});
