import expressJwt from "express-jwt";

export const jwtHandler = expressJwt({ secret: process.env.JWT_SECRET });
