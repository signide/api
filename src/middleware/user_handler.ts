import { RequestHandler, Request, Response } from "express";
import { Role, getUser, IUser } from "../routes/users/model";
import { IExtendedRequest } from "../types/extended_request";
import { getEntry } from "../routes/entries/model";

type RequiredRole = Role | "self";

async function getUserInfoFromToken(
  req: IExtendedRequest,
  res: Response
): Promise<IUser | void> {
  const id = Number(req.user.id);
  const user = await getUser(id);
  if (!user) {
    res.status(401).send({
      error: "no user associated with token"
    });
  }

  return user;
}

function checkAuthorization(
  id: number,
  user: IUser,
  requiredRole: RequiredRole,
  allowMatchingID: boolean,
  res: Response
): boolean {
  const roles = ["regular", "manager", "admin"];
  const authorizedRole =
    roles.indexOf(user.role) >= roles.indexOf(requiredRole);
  const authorizedID = id === user.id;

  if (requiredRole === "self" && !authorizedID) {
    res.status(401).send({
      error: `only the owner of this resource can access it`
    });
    return false;
  }

  if (!authorizedRole) {
    if (!allowMatchingID) {
      res.status(401).send({
        error: `only ${requiredRole}(s) can access this resource`
      });
      return false;
    }

    res.status(401).send({
      error: `only ${requiredRole}(s) and the owner of this resource can access it`
    });
    return false;
  }

  return true;
}

export function createUserHandler(
  requiredRole: RequiredRole = "regular",
  allowMatchingID?: boolean
): RequestHandler {
  return async (req: IExtendedRequest, res, next) => {
    try {
      const user = await getUserInfoFromToken(req, res);
      if (!user) {
        return;
      }

      const authorized = checkAuthorization(
        Number(req.params.id),
        user,
        requiredRole,
        allowMatchingID,
        res
      );
      if (!authorized) {
        return;
      }

      req.userInfo = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function createEntryHandler(
  requiredRole: RequiredRole = "regular",
  allowMatchingID?: boolean
): RequestHandler {
  return async (req: IExtendedRequest, res, next) => {
    try {
      const user = await getUserInfoFromToken(req, res);
      if (!user) {
        return;
      }

      const entryID = Number(req.params.id);
      const entry = await getEntry(entryID);
      if (!entry) {
        return res.status(404).send({
          error: `no entry associated with id ${entryID}`
        });
      }

      const authorized = checkAuthorization(
        entry.user.id,
        user,
        requiredRole,
        allowMatchingID,
        res
      );
      if (!authorized) {
        return;
      }

      req.userInfo = user;
      req.entryInfo = entry;
      next();
    } catch (err) {
      next(err);
    }
  };
}
