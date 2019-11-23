import Joi from "joi";

const fields = {
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30),

  password: Joi.string()
    .min(8)
    .max(150),

  email: Joi.string().email()
};

export const updateUserSchema = Joi.object(fields)
  .append({
    oldPassword: Joi.string()
      .min(8)
      .max(150)
  })
  .with("password", "oldPassword");

export const userSchema = Joi.object(
  Object.entries(fields).reduce((acc, curr) => {
    const [key, value] = curr;
    acc[key] = value.required();
    return acc;
  }, {})
);
