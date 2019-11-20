import express from "express";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import { createUser, getUser, IUser } from "./model";
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

    res.status(201).send({ auth: true, token });
  } catch (err) {
    if (err.message.includes("duplicate")) {
      const [_, type] = err.detail.match(/\(([^\)]+)\)/);
      const message = `${type} '${req.body[type]}' already exists`;
      console.warn(err);
      return res.status(422).send({
        error: message
      });
    }

    console.warn(err);
    res.status(500).send({
      error: "something went wrong"
    });
  }
});

userRouter.get(
  "/me",
  expressJwt({ secret }),
  async (req: IExtendedRequest, res) => {
    try {
      const user = await getUser(Number(req.user.id));
      const { password, ...userInfo } = <IUser>user;
      res.status(200).send(userInfo);
    } catch (err) {
      const { message } = err;
      console.warn(err);
      res.status(500).send({
        error: message
      });
    }
  }
);
