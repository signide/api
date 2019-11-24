import joi from "joi";
import { RequestHandler } from "express";

/**
 * Creates a middleware that validates req.body using a joi schema.
 *
 * @param schema - The joi schema
 * @returns The middleware
 */
export function createValidator(schema: joi.Schema): RequestHandler {
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
