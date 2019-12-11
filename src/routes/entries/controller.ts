import express from "express";
import { entrySchema } from "./schema";
import { createValidator } from "../../middleware/validator";
import { checkJSONHeader } from "../../middleware/header_checker";
import { jwtHandler } from "../../middleware/jwt_handler";
import { createUserHandler, createEntryHandler } from "../../middleware/user_handler";
import { CityError } from "../../types/city_error";
import { ExtendedRequest } from "../../types/extended_request";
import { getWeatherData } from "./get_weather";
import { getRepository } from "typeorm";
import { Entry } from "../../entities/entry";
import { City } from "../../entities/city";

export const entryRouter = express.Router();

const removePassword = (entry: Entry) => delete entry.user.password;

entryRouter.post(
  "/",
  checkJSONHeader,
  jwtHandler,
  createValidator(entrySchema),
  createUserHandler(),
  async (req: ExtendedRequest, res, next) => {
    try {
      const repo = getRepository(Entry);
      const cityRepo = getRepository(City);
      const city = req.body.cityId
        ? await cityRepo.findOne(req.body.cityId)
        : await cityRepo.findOne({ name: req.body.cityName });
      const weather = await getWeatherData(city.id);

      const result = await repo.save({
        user: req.userInfo,
        city,
        ...weather,
        ...req.body
      });

      const entry = await repo.findOne(result.id, { relations: ["user"] });
      removePassword(entry);
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
  async (req: ExtendedRequest, res, next) => {
    try {
      removePassword(req.entryInfo);
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
  async (req: ExtendedRequest, res, next) => {
    try {
      const entries = await getRepository(Entry).find({ relations: ["user"] });
      entries.forEach(removePassword);
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
  async (req: ExtendedRequest, res, next) => {
    try {
      await getRepository(Entry).remove(req.entryInfo);
      removePassword(req.entryInfo);
      req.entryInfo.id = Number(req.params.id);
      res.status(200).send(req.entryInfo);
    } catch (err) {
      next(err);
    }
  }
);
