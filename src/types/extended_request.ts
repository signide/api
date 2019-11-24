import { Request } from "express";
import { Dictionary } from "./utility";
import { IUser } from "../routes/users/model";

export interface IExtendedRequest extends Request {
  user?: Dictionary<any>; // from expressJWT
  userInfo?: IUser; // from createUserHandler and createEntryHandler middleware
  entryInfo?: Dictionary<any>; // from createEntryHandler middleware
}
