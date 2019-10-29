import express from "express";
import { store } from "../db/user";

function capitalize(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export const userRouter = express.Router();

userRouter.post("/", async (req, res) => {
  const requiredFields = ["username", "password", "email"];

  for (const field of requiredFields) {
    if (req.body[field] == null) {
      return res.status(400).send(`The ${field} field is required.`);
    }
    if (typeof req.body[field] !== "string") {
      return res.status(400).send(`The ${field} field must be a string.`);
    }
  }

  try {
    const data = await store(req.body);
    res.status(201).send(`Successfully created user '${data.username}'`);
  } catch (err) {
    if (err.message.includes("duplicate")) {
      const type = err.constraint.split("_")[0];
      return res
        .status(400)
        .send(`${capitalize(type)} '${req.body[type]}' already exists.`);
    }

    res.status(400).send("Something went wrong.");
  }
});
