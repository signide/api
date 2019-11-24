import { RequestHandler } from "express";

/**
 * Creates a middleware that checks the `Content-Type` header
 * for a particular value.
 *
 * @param contentType - The value to check for
 * @returns The middleware
 */
export function checkContentType(contentType: string): RequestHandler {
  return (req, res, next) => {
    const reqContentType = req.get("Content-Type");
    if (!reqContentType) {
      return res.status(400).send({
        error: `missing Content-Type ${contentType}`
      });
    }

    if (reqContentType !== contentType) {
      return res.status(400).send({
        error: `incorrect Content-Type ${reqContentType}, expected ${contentType}`
      });
    }

    next();
  };
}

export const checkJSONHeader = checkContentType("application/json");
