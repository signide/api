import { Schema } from "joi";

export function createValidator(schema: Schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map(i => i.message).join(",");
      console.warn(error);
      res.status(422).json({ error: message });
    }
  };
}
