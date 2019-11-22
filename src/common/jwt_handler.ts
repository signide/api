import expressJwt from "express-jwt";
import { jwtConfig } from "../config/config";

const { secret } = jwtConfig;
export const jwtHandler = expressJwt({ secret });
