import express from "express";
import expressJwt from "express-jwt";
import fetch from "node-fetch";
import { IExtendedRequest } from "../common/request.interface";
import { jwtConfig } from "../config/config";
import { createValidator } from "../common/validation";
import { entrySchema } from "./schema";
import { createEntry, getEntry, getCityIDFromName } from "./model";
import { apiKeys } from "../config/config";

const { secret } = jwtConfig;
export const entryRouter = express.Router();

async function getWeatherData(id: string) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?appid=${apiKeys.weather}&id=${id}`
  );

  const data = await response.json();
  const result = {
    wind: data.wind?.speed,
    temp: data.main?.temp,
    humidity: data.main?.humidity,
    description: data.weather[0].description
  };

  return result;
}

entryRouter.post(
  "/",
  expressJwt({ secret }),
  createValidator(entrySchema),
  async (req: IExtendedRequest, res) => {
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
