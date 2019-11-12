import { Dictionary } from "./utility_types";
import { Request } from "express";

export interface IExtendedRequest extends Request {
  user?: Dictionary<any>;
}
