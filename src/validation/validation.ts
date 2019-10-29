import Joi, { Schema } from "joi";

export function createValidator(schema: Schema) {
  return (req, res, next) => {
    const { error } = Joi.validate(req.body, schema);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map(i => i.message).join(",");
      console.warn(`ERROR: ${message}`);
      res.status(422).json({ error: message });
      // throw new Error(message)
    }
  };
}
