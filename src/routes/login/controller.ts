import express from "express";
import jwt from "jsonwebtoken";
import { checkJSONHeader } from "../../middleware/header_checker";
import { getUserByName } from "../users/model";
import { jwtConfig } from "../../config/config";
import { compare } from "../../utility/hashing";

const { secret } = jwtConfig;
export const loginRouter = express.Router();

loginRouter.post("/", checkJSONHeader, async (req, res, next) => {
  try {
    const user = await getUserByName(req.body.username);
    if (!user) {
      return res.status(404).send({
        error: `user "${req.body.username}" not found`
      });
    }

    const { id, username, password, email, role } = user;
    const isMatch = await compare(req.body.password, password);
    if (!isMatch) {
      return res.status(401).send({
        error: `incorrect password`
      });
    }

    const token = jwt.sign({ id, username }, secret, {
      expiresIn: 86400
    });
    res.status(201).send({
      auth: true,
      token,
      user: {
        id,
        username,
        email,
        role
      }
    });
  } catch (err) {
    next(err);
  }
});
