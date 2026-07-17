import { Hono } from "hono";
import { CreateReplayRequestSchema } from "@bboyarena/shared/schemas";
import { requireAuth } from "../middleware/auth.ts";
import { createReplayService } from "../services/replay.service.ts";

const replayService = createReplayService();

export const replayRoutes = new Hono()
  .get("/replays/:id", async (c) => {
    const replay = await replayService.getReplay(c.req.param("id"));

    return c.json({ replay });
  })
  .post("/replays", requireAuth, async (c) => {
    const input = CreateReplayRequestSchema.parse(await c.req.json());
    const replay = await replayService.createReplay(c.get("userId"), input);

    return c.json({ replay }, 201);
  });
