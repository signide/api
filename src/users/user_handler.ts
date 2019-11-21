import { RequestHandler } from "express";
import { Role, getUser } from "./model";
import { IExtendedRequest } from "../common/request.interface";

export function createUserHandler(
  requiredRole: Role = "regular",
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
      const authorizedID = allowMatchingID
        ? Number(req.params.id) === user.id
        : false;

      if (!authorizedRole && !authorizedID) {
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
