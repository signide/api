import express from "express";
import {
  createEntry,
  getCityIDFromName,
  getEntries,
  deleteEntry
} from "./model";
import { entrySchema } from "./schema";
import { createValidator } from "../../middleware/validator";
import { checkJSONHeader } from "../../middleware/header_checker";
import { jwtHandler } from "../../middleware/jwt_handler";
import {
  createUserHandler,
  createEntryHandler
} from "../../middleware/user_handler";
import { CityError } from "../../types/city_error";
import { IExtendedRequest } from "../../types/extended_request";
import { getWeatherData } from "./get_weather";

export const entryRouter = express.Router();

entryRouter.post(
  "/",
  checkJSONHeader,
  jwtHandler,
  createValidator(entrySchema),
  createUserHandler(),
  async (req: IExtendedRequest, res, next) => {
    try {
      const cityID =
        req.body.cityID ?? (await getCityIDFromName(req.body.cityName));

      const data = {
        userID: req.user.id,
        weather: await getWeatherData(cityID),
        cityID,
        ...req.body
      };

      const entry = await createEntry(data);
      res.status(201).send(entry);
    } catch (err) {
      if (err instanceof CityError) {
        console.warn(err);
        return res.status(422).send({
          error: err.message
        });
      }
      next(err);
    }
  }
);

entryRouter.get(
  "/:id",
  jwtHandler,
  createEntryHandler("admin", true),
  async (req: IExtendedRequest, res, next) => {
    try {
      res.status(200).send(req.entryInfo);
    } catch (err) {
      next(err);
    }
  }
);

entryRouter.get(
  "/",
  jwtHandler,
  createUserHandler("admin"),
  async (req: IExtendedRequest, res, next) => {
    try {
      const entries = await getEntries();
      if (entries.length === 0) {
        return res.status(404).send({
          error: "no entries found"
        });
      }

      res.status(200).send(entries);
    } catch (err) {
      next(err);
    }
  }
);

entryRouter.delete(
  "/:id",
  jwtHandler,
  createEntryHandler("admin", true),
  async (req: IExtendedRequest, res, next) => {
    try {
      const deleted = await deleteEntry(req.entryInfo.id);
      res.status(200).send(deleted);
    } catch (err) {
      next(err);
    }
  }
);
