import { RequestHandler } from "express";
import { Role, getUser } from "./model";
import { IExtendedRequest } from "../common/request.interface";

export function createUserHandler(
  requiredRole: Role = "regular"
): RequestHandler {
  return async (req: IExtendedRequest, res, next) => {
    try {
      const user = await getUser(Number(req.user.id));
      if (!user) {
        return res.status(401).send({
          error: "no user associated with token"
        });
      }

      const roles = ["regular", "manager", "admin"];
      const authorized =
        roles.indexOf(user.role) >= roles.indexOf(requiredRole);
      if (!authorized) {
        return res.status(401).send({
          error: `only ${requiredRole}s and above can access this endpoint`
        });
      }

      req.userInfo = user;
      next();
    } catch (err) {
      console.warn(err);
      res.status(500).send({
        error: "something went wrong"
      });
    }
  };
}
