import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/error.ts";
import { requestLogger } from "./middleware/logger.ts";
import { authRoutes } from "./routes/auth.ts";
import { leaderboardRoutes } from "./routes/leaderboard.ts";
import { newsletterRoutes } from "./routes/newsletter.ts";
import { profileRoutes } from "./routes/profile.ts";
import { replayRoutes } from "./routes/replay.ts";
import { trainingRoutes } from "./routes/training.ts";
import { usersRoutes } from "./routes/users.ts";

export const createApp = () => {
  const app = new Hono();

  app.onError(errorHandler);
  app.use("*", requestLogger);
  app.use("*", cors());

  app.get("/health", (c) => c.json({ ok: true, service: "bboyarena-server" }));

  app.route("/api", authRoutes);
  app.route("/api", usersRoutes);
  app.route("/api", profileRoutes);
  app.route("/api", leaderboardRoutes);
  app.route("/api", newsletterRoutes);
  app.route("/api", replayRoutes);
  app.route("/api", trainingRoutes);

  return app;
};

export type App = ReturnType<typeof createApp>;
