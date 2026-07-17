import type { MiddlewareHandler } from "hono";
import type { User } from "@bboyarena/shared/types";
import { createAuthRepository } from "../repositories/auth.repository.ts";
import { createAuthService } from "../services/auth.service.ts";

export type AuthVariables = {
  userId: string;
  user: User;
};

const authService = createAuthService(createAuthRepository());

export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const authorization = c.req.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return c.json({ error: "UNAUTHORIZED" }, 401);
  }

  const session = await authService.authenticateToken(authorization.slice("Bearer ".length));

  c.set("userId", session.user.id);
  c.set("user", session.user);
  await next();
};
