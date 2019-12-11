import { Request } from "express";
import { Entry } from "../entities/entry";
import { User } from "../entities/user";

export interface ExtendedRequest extends Request {
  user?: Pick<User, "id" | "username">; // from expressJWT
  userInfo?: User; // from createUserHandler and createEntryHandler middleware
  entryInfo?: Entry; // from createEntryHandler middleware
}
