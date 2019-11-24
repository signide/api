import express from "express";
import fetch from "node-fetch";
import {
  createEntry,
  getEntry,
  getCityIDFromName,
  getEntries,
  deleteEntry
} from "./model";
import { entrySchema } from "./schema";
import { createValidator } from "../../middleware/validator";
import { checkJSONHeader } from "../../middleware/header_checker";
import { jwtHandler } from "../../middleware/jwt_handler";
import { createUserHandler } from "../../middleware/user_handler";
import { CityError } from "../../types/city_error";
import { IExtendedRequest } from "../../types/extended_request";
import { apiKeys } from "../../config/config";

export const entryRouter = express.Router();

interface IWeather {
  wind: number;
  temp: number;
  humidity: number;
  description: string;
}

async function getWeatherData(id: number): Promise<IWeather> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?appid=${apiKeys.weather}&id=${id}`
  );

  const data = await response.json();
  if (data.cod === "404") {
    throw new CityError(id);
  }

  const result = {
    wind: data.wind?.speed,
    temp: data.main?.temp,
    humidity: data.main?.humidity,
    description: data.weather?.[0].description
  };

  return result;
}

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
  createUserHandler("admin", true),
  async (req: IExtendedRequest, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = await getEntry(id);
      if (!data) {
        return res.status(404).send({
          error: `no entry found for id ${id}`
        });
      }

      res.status(200).send(data);
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
  createUserHandler("admin", true),
  async (req: IExtendedRequest, res, next) => {
    try {
      const id = Number(req.params.id);
      const deleted = await deleteEntry(id);
      if (!deleted) {
        return res.status(404).send({
          error: `no entry found for id ${id}`
        });
      }

      res.status(200).send(deleted);
    } catch (err) {
      next(err);
    }
  }
);
