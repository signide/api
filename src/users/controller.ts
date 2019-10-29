import express from "express";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import { createUser, getUser } from "./model";
import { createValidator } from "../validation/validation";
import { userSchema } from "../validation/schemas";
import { jwtConfig } from "../config/config";
import { IExtendedRequest } from "../common/request.interface";

function capitalize(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

const { secret } = jwtConfig;
export const userRouter = express.Router();

userRouter.post("/", createValidator(userSchema), async (req, res) => {
  try {
    const data = await createUser(req.body);
    const token = jwt.sign({ id: data.username }, secret, {
      expiresIn: 86400
    });

    res.status(201).send({ auth: true, token: token });
  } catch (err) {
    if (err.message.includes("duplicate")) {
      const type = err.constraint.split("_")[0];
      return res
        .status(400)
        .send(`${capitalize(type)} '${req.body[type]}' already exists.`);
    }

    res.status(400).send("Something went wrong.");
  }
});

userRouter.get(
  "/me",
  expressJwt({ secret }),
  async (req: IExtendedRequest, res) => {
    try {
      const userInfo = await getUser(req.user.id);
      res.status(200).json(userInfo);
    } catch (err) {
      res.status(404).send(err.message);
    }
  }
);
