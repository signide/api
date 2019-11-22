import express from "express";
import jwt from "jsonwebtoken";
import { createUser, getUser, getUsers, updateUser } from "./model";
import { userSchema, partialUserSchema } from "./schema";
import { createUserHandler } from "../../middleware/user_handler";
import { jwtHandler } from "../../middleware/jwt_handler";
import { createValidator } from "../../middleware/validator";
import { checkJSONHeader } from "../../middleware/header_checker";
import { IExtendedRequest } from "../../types/extended_request";
import { getAverages } from "../entries/model";
import { jwtConfig } from "../../config/config";
import { createHash } from "../../utility/hashing";

const { secret, tokenExpireTime } = jwtConfig;
export const userRouter = express.Router();

userRouter.post(
  "/",
  checkJSONHeader,
  createValidator(userSchema),
  async (req, res, next) => {
    try {
      const { id, username } = await createUser(req.body);
      const token = jwt.sign({ id, username }, secret, {
        expiresIn: tokenExpireTime
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
  }
);

userRouter.get(
  "/",
  jwtHandler,
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
  jwtHandler,
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
  jwtHandler,
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
  jwtHandler,
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

userRouter.patch(
  "/:id",
  checkJSONHeader,
  jwtHandler,
  createValidator(partialUserSchema),
  createUserHandler("self"),
  async (req: IExtendedRequest, res, next) => {
    try {
      const id = Number(req.params.id);
      const { ...toUpdate } = req.body;
      if (toUpdate.password) {
        toUpdate.password = await createHash(toUpdate.password);
      }
      const user = await updateUser(id, toUpdate);

      if (!user) {
        return res.status(404).send({
          error: `no user found for id ${id}`
        });
      }

      const { password, ...userInfo } = user;
      res.status(200).send(userInfo);
    } catch (err) {
      next(err);
    }
  }
);
