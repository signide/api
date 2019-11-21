import express from "express";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import { createUser, getUser, getUsers } from "./model";
import { createValidator } from "../common/validation";
import { userSchema } from "./schema";
import { jwtConfig } from "../config/config";
import { IExtendedRequest } from "../common/request.interface";
import { createUserHandler } from "./user_handler";
import { getAverages } from "../entries/model";

const { secret } = jwtConfig;
export const userRouter = express.Router();

userRouter.post("/", createValidator(userSchema), async (req, res, next) => {
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

    next(err);
  }
});

userRouter.get(
  "/",
  expressJwt({ secret }),
  createUserHandler("manager"),
  async (req: IExtendedRequest, res, next) => {
    try {
      const users = await getUsers();
      return res.status(200).send(users);
    } catch (err) {
      next(err);
    }
  }
);

userRouter.get(
  "/me",
  expressJwt({ secret }),
  createUserHandler(),
  async (req: IExtendedRequest, res, next) => {
    try {
      const { password, ...user } = req.userInfo;
      res.status(200).send(user);
    } catch (err) {
      next(err);
    }
  }
);

userRouter.get(
  "/:id",
  expressJwt({ secret }),
  createUserHandler("manager", true),
  async (req: IExtendedRequest, res, next) => {
    try {
      const id = Number(req.params.id);
      const user = await getUser(id);

      if (!user) {
        return res.status(404).send({
          error: `no user found for id ${id}`
        });
      }

      const { password, ...userInfo } = user;
      return res.status(200).send(userInfo);
    } catch (err) {
      next(err);
    }
  }
);

userRouter.get(
  "/:id/average",
  expressJwt({ secret }),
  createUserHandler("admin", true),
  async (req: IExtendedRequest, res, next) => {
    try {
      const id = Number(req.params.id);
      const averages = await getAverages(id);

      if (!averages) {
        return res.status(404).send({
          error: `no data found for user id ${id}`
        });
      }
      res.status(200).send(averages);
    } catch (err) {
      next(err);
    }
  }
);
