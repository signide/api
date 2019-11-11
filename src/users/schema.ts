import Joi from "joi";

export const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  password: Joi.string()
    .min(8)
    .max(150)
    .required(),

  email: Joi.string()
    .email()
    .required()
});
