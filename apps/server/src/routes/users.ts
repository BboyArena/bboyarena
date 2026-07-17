import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.ts";
export const usersRoutes = new Hono().get("/me", requireAuth, async (c) => {
  return c.json({ user: c.get("user") });
});
