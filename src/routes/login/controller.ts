import express from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../../entities/user";
import { checkJSONHeader } from "../../middleware/header_checker";
import { jwtConfig } from "../../config/config";
import { compare } from "../../utility/hashing";

const { secret } = jwtConfig;
export const loginRouter = express.Router();

loginRouter.post("/", checkJSONHeader, async (req, res, next) => {
  try {
    const user = await getRepository(User).findOne({
      username: req.body.username
    });
    if (!user) {
      return res.status(404).send({
        error: `user "${req.body.username}" not found`
      });
    }

    const { password, ...userWithoutPassword } = user;

    const isMatch = await compare(req.body.password, password);
    if (!isMatch) {
      return res.status(401).send({
        error: `incorrect password`
      });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, secret, {
      expiresIn: 86400
    });
    res.status(201).send({
      auth: true,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
});
