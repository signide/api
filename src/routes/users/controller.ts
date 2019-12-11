import express from "express";
import jwt from "jsonwebtoken";
import { userSchema, updateUserSchema } from "./schema";
import { createUserHandler } from "../../middleware/user_handler";
import { jwtHandler } from "../../middleware/jwt_handler";
import { createValidator } from "../../middleware/validator";
import { checkJSONHeader } from "../../middleware/header_checker";
import { ExtendedRequest } from "../../types/extended_request";
import { jwtConfig } from "../../config/config";
import { createHash, compare } from "../../utility/hashing";
import { getRepository } from "typeorm";
import { User } from "../../entities/user";
import { getAverages } from "../entries/get_averages";

const { secret, tokenExpireTime } = jwtConfig;
export const userRouter = express.Router();

userRouter.post(
  "/",
  checkJSONHeader,
  createValidator(userSchema),
  async (req, res, next) => {
    try {
      const repo = getRepository(User);
      const userInfo = { ...req.body, password: await createHash(req.body.password) };
      await repo.save(userInfo);

      const user = await repo.findOne({
        username: req.body.username
      });
      const token = jwt.sign({ id: user.id, username: user.username }, secret, {
        expiresIn: tokenExpireTime
      });

      const { password, ...userWithoutPassword } = user;

      res.status(201).send({
        auth: true,
        token,
        user: userWithoutPassword
      });
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
  async (req: ExtendedRequest, res, next) => {
    try {
      const users = await getRepository(User).find();
      users.forEach(user => delete user.password);
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
  async (req: ExtendedRequest, res, next) => {
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
  async (req: ExtendedRequest, res, next) => {
    try {
      const user = await getRepository(User).findOne(req.params.id);

      if (!user) {
        return res.status(404).send({
          error: `no user found for id ${req.params.id}`
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
  async (req: ExtendedRequest, res, next) => {
    try {
      const averages = await getAverages(Number(req.params.id));

      if (!averages) {
        return res.status(404).send({
          error: `no data found for user id ${req.params.id}`
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
  createValidator(updateUserSchema),
  createUserHandler("self"),
  async (req: ExtendedRequest, res, next) => {
    try {
      const id = req.userInfo.id;
      const { ...toUpdate } = req.body;
      const pass = toUpdate.password;
      if (pass) {
        const matched = await compare(toUpdate.oldPassword, req.userInfo.password);
        if (!matched) {
          return res.status(401).send({
            error: `incorrect oldPassword for id ${id}`
          });
        }

        toUpdate.password = await createHash(toUpdate.password);
        delete toUpdate.oldPassword;
      }

      const repo = getRepository(User);
      await repo.update({ id }, toUpdate);
      const user = await repo.findOne(id);
      const { password, ...userInfo } = user;
      res.status(200).send(userInfo);
    } catch (err) {
      next(err);
    }
  }
);

userRouter.delete(
  "/:id",
  jwtHandler,
  createUserHandler("admin"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const repo = getRepository(User);
      const user = await repo.findOne(id);
      const result = await repo.remove(user);
      if (user == null) {
        return res.status(404).send({
          error: `no user found for id ${id}`
        });
      }

      const { password, ...userInfo } = result;
      userInfo.id = id;
      res.status(200).send(userInfo);
    } catch (err) {
      next(err);
    }
  }
);
