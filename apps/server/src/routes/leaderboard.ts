import { Hono } from "hono";
import { SubmitScoreRequestSchema } from "@bboyarena/shared/schemas";
import { requireAuth } from "../middleware/auth.ts";
import { createLeaderboardRepository } from "../repositories/leaderboard.repository.ts";
import { createLeaderboardService } from "../services/leaderboard.service.ts";

const leaderboardService = createLeaderboardService(createLeaderboardRepository());

export const leaderboardRoutes = new Hono()
  .get("/leaderboard", async (c) => {
    const leaderboard = await leaderboardService.getLeaderboard();

    return c.json({ leaderboard });
  })
  .post("/scores", requireAuth, async (c) => {
    const input = SubmitScoreRequestSchema.parse(await c.req.json());
    const score = await leaderboardService.submitScore(c.get("userId"), input);

    return c.json({ score }, 201);
  });
