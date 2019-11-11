import express from "express";
import expressJwt from "express-jwt";
import { IExtendedRequest } from "./../common/request.interface";
import { jwtConfig } from "./../config/config";
import { createValidator } from "../common/validation";
import { entrySchema } from "./schema";
import { createEntry } from "./model";

const { secret } = jwtConfig;
export const entryRouter = express.Router();

entryRouter.post(
  "/",
  expressJwt({ secret }),
  createValidator(entrySchema),
  async (req: IExtendedRequest, res) => {
    try {
      const data = await createEntry({ userID: req.user.id, ...req.body });
      res.status(201).send(data);
    } catch (err) {
      res.status(400).send({
        error: err.message
      });
    }
  }
);
