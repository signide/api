import { RequestHandler } from "express";
import { Role, getUser } from "../routes/users/model";
import { IExtendedRequest } from "../types/extended_request";

export function createUserHandler(
  requiredRole: Role | "self" = "regular",
  allowMatchingID?: boolean
): RequestHandler {
  return async (req: IExtendedRequest, res, next) => {
    try {
      const id = Number(req.user.id);
      const user = await getUser(id);
      if (!user) {
        return res.status(401).send({
          error: "no user associated with token"
        });
      }

      const roles = ["regular", "manager", "admin"];
      const authorizedRole =
        roles.indexOf(user.role) >= roles.indexOf(requiredRole);
      const authorizedID = Number(req.params.id) === user.id;

      if (requiredRole === "self" && !authorizedID) {
        return res.status(401).send({
          error: `only the owner of this resource can access it`
        });
      }

      if (!authorizedRole) {
        if (!allowMatchingID) {
          return res.status(401).send({
            error: `only ${requiredRole}(s) can access this resource`
          });
        }

        return res.status(401).send({
          error: `only ${requiredRole}(s) and the owner of this resource can access it`
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
