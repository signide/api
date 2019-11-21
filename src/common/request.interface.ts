import { Dictionary } from "./utility_types";
import { Request } from "express";
import { IUser } from "../users/model";

export interface IExtendedRequest extends Request {
  user?: Dictionary<any>; // from expressJWT
  userInfo?: IUser; // from createUserHandler middleware
}
