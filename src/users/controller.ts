import express from "express";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import { createUser, getUser } from "./model";
import { createValidator } from "../common/validation";
import { userSchema } from "./schema";
import { jwtConfig } from "../config/config";
import { IExtendedRequest } from "../common/request.interface";

const { secret } = jwtConfig;
export const userRouter = express.Router();

userRouter.post("/", createValidator(userSchema), async (req, res) => {
  try {
    const { id, username } = await createUser(req.body);
    const token = jwt.sign({ id, username }, secret, {
      expiresIn: 86400
    });

    res.status(201).send({ auth: true, token: token });
  } catch (err) {
    if (err.message.includes("duplicate")) {
      const type = err.constraint.split("_")[0];
      const message = `${type} "${req.body[type]}" already exists`;
      console.warn(`ERROR: ${message}`);
      return res.status(400).send({
        error: message
      });
    }

    res.status(400).send({
      error: "something went wrong"
    });
  }
});

userRouter.get(
  "/me",
  expressJwt({ secret }),
  async (req: IExtendedRequest, res) => {
    try {
      const userInfo = await getUser(Number(req.user.id));
      res.status(200).send(userInfo);
    } catch (err) {
      const { message } = err;
      console.warn(`ERROR: ${message}`);
      res.status(404).send({
        error: message
      });
    }
  }
);
