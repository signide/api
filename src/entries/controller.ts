import express from "express";
import expressJwt from "express-jwt";
import { IExtendedRequest } from "./../common/request.interface";
import { jwtConfig } from "./../config/config";
import { createValidator } from "../common/validation";
import { entrySchema } from "./schema";
import { createEntry, getEntry } from "./model";

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

entryRouter.get(
  "/:id",
  expressJwt({ secret }),
  async (req: IExtendedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const data = await getEntry(id);
      if (!data) {
        return res.status(404).send({
          error: `no entry found for id ${id}`
        });
      }
      if (req.user.id !== data.user.id) {
        return res.status(401).send({
          error: "your id does not match entry owner's user id"
        });
      }
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send({
        error: err.message
      });
    }
  }
);
