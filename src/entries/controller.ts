import express from "express";
import expressJwt from "express-jwt";
import fetch from "node-fetch";
import { IExtendedRequest } from "../common/request.interface";
import { jwtConfig } from "../config/config";
import { createValidator } from "../common/validation";
import { entrySchema } from "./schema";
import { createEntry, getEntry, getCityIDFromName } from "./model";
import { apiKeys } from "../config/config";
import { CityError } from "../common/errors";
import { createUserHandler } from "../users/user_handler";
import { checkJSONHeader } from "../common/check_header";

const { secret } = jwtConfig;
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
  expressJwt({ secret }),
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
  expressJwt({ secret }),
  createUserHandler(),
  async (req: IExtendedRequest, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = await getEntry(id);
      if (!data) {
        return res.status(404).send({
          error: `no entry found for id ${id}`
        });
      }

      if (req.userInfo.id !== data.user.id && req.userInfo.role !== "admin") {
        return res.status(401).send({
          error: "your id does not match entry owner's user id"
        });
      }

      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }
);
