import express from "express";
import { store } from "../db/user";
import { createValidator } from "../validation/validation";
import { userSchema } from "../validation/schemas";

function capitalize(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export const userRouter = express.Router();

userRouter.post("/", createValidator(userSchema), async (req, res) => {
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
