import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.ts";

export const trainingRoutes = new Hono().post("/training", requireAuth, (c) =>
  c.json(
    {
      status: "not_implemented",
      message: "Training sessions are reserved for a future service layer.",
    },
    501,
  ),
);
