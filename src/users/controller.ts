import express from "express";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import { createUser, getUser, IUser, getUsers } from "./model";
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
  "/",
  expressJwt({ secret }),
  async (req: IExtendedRequest, res) => {
    try {
      const user = await getUser(Number(req.user.id));
      if (!user) {
        return res.status(401).send({
          error: "no user associated with token"
        });
      }

      const isManager = ["manager", "admin"].includes(user.role);
      if (isManager) {
        const users = await getUsers();
        return res.status(200).send(users);
      }

      return res.status(401).send({
        error: "only managers and above can access this endpoint"
      });
    } catch (err) {
      console.warn(err);
      res.status(500).send({
        error: "something went wrong"
      });
    }
  }
);

userRouter.get(
  "/:id",
  expressJwt({ secret }),
  async (req: IExtendedRequest, res) => {
    try {
      const id = Number(req.user.id);
      const user = await getUser(id);
      if (!user) {
        return res.status(401).send({
          error: "no user associated with token"
        });
      }

      const isManager = ["manager", "admin"].includes(user.role);
      if (isManager) {
        const user = await getUser(Number(req.params.id));
        if (!user) {
          return res.status(404).send({
            error: `no user found for id ${id}`
          });
        }
        const { password, ...userInfo } = user;
        return res.status(200).send(userInfo);
      }

      return res.status(401).send({
        error: "only managers and above can access this endpoint"
      });
    } catch (err) {
      const { message } = err;
      console.warn(err);

      res.status(500).send({
        error: message
      });
    }
  }
);

userRouter.get(
  "/me",
  expressJwt({ secret }),
  async (req: IExtendedRequest, res) => {
    try {
      const user = await getUser(Number(req.user.id));
      if (!user) {
        return res.status(401).send({
          error: "no user associated with token"
        });
      }

      const { password, ...userInfo } = user;
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
