import { Entry } from "./../entities/entry";
import { User } from "../entities/user";
import { RequestHandler, Response } from "express";
import { ExtendedRequest } from "../types/extended_request";
import { Role } from "../entities/user";
import { getRepository } from "typeorm";

type RequiredRole = Role | "self";

async function getUserInfoFromToken(req: ExtendedRequest, res: Response) {
  const user = await getRepository(User).findOne(req.user.id);
  if (user.id == null) {
    res.status(401).send({
      error: "no user associated with token"
    });
  }

  return user;
}

function checkAuthorization(
  id: number,
  user: User,
  requiredRole: RequiredRole,
  allowMatchingId: boolean,
  res: Response
): boolean {
  const roles = ["regular", "manager", "admin"];
  const authorizedRole = roles.indexOf(user.role) >= roles.indexOf(requiredRole);
  const authorizedId = id === user.id;

  if (requiredRole === "self" && !authorizedId) {
    res.status(401).send({
      error: `only the owner of this resource can access it`
    });
    return false;
  }

  if (!authorizedRole) {
    if (!allowMatchingId) {
      res.status(401).send({
        error: `only ${requiredRole}(s) can access this resource`
      });
      return false;
    }

    if (authorizedId) {
      return true;
    }

    res.status(401).send({
      error: `only ${requiredRole}(s) and the owner of this resource can access it`
    });
    return false;
  }

  return true;
}

/**
 * Creates a middleware that handles the user's JWT data and attaches it to req.userInfo,
 * and checks if the user is authorized to access the resource.
 *
 * @param requiredRole - The required role
 * @param allowMatchingId - Allows the required role to be overridden if the user's Id
 * matches the param's Id
 * @returns The middleware
 */
export function createUserHandler(
  requiredRole: RequiredRole = "regular",
  allowMatchingId?: boolean
): RequestHandler {
  return async (req: ExtendedRequest, res, next) => {
    try {
      const user = await getUserInfoFromToken(req, res);
      if (user.id == null) {
        return;
      }

      const authorized = checkAuthorization(
        Number(req.params.id),
        user,
        requiredRole,
        allowMatchingId,
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

/**
 * Creates a middleware that handles the entry's data and attaches it to req.entryInfo,
 * the user's JWT data and attaches it to req.userInfo,
 * and checks if the user is authorized to access the resource.
 *
 * @param requiredRole - The required role
 * @param allowMatchingId - Allows the required role to be overridden if the user's Id matches the param's Id
 * @returns The middleware
 */
export function createEntryHandler(
  requiredRole: RequiredRole = "regular",
  allowMatchingId?: boolean
): RequestHandler {
  return async (req: ExtendedRequest, res, next) => {
    try {
      const user = await getUserInfoFromToken(req, res);
      if (!user) {
        return;
      }

      const entryId = Number(req.params.id);
      const entry = await getRepository(Entry).findOne(entryId, { relations: ["user"] });
      if (!entry) {
        return res.status(404).send({
          error: `no entry associated with id ${entryId}`
        });
      }

      const authorized = checkAuthorization(
        entry.user.id,
        user,
        requiredRole,
        allowMatchingId,
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
