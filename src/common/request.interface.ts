import { Request } from "express";

interface Dictionary<T> {
  [Key: string]: T;
}

export interface IExtendedRequest extends Request {
  user?: Dictionary<any>;
}
