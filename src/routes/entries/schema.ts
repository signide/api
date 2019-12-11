import Joi from "joi";

export const entrySchema = Joi.object({
  date: Joi.date()
    .iso()
    .required(),

  distance: Joi.number()
    .integer()
    .positive()
    .required(),

  duration: Joi.number()
    .integer()
    .positive()
    .required(),

  cityName: Joi.string(),
  cityId: Joi.number().positive()
}).xor("cityName", "cityId");
