import { Hono } from "hono";
import { UpdateProfileRequestSchema } from "@bboyarena/shared/schemas";
import { requireAuth } from "../middleware/auth.ts";
import { createUserRepository } from "../repositories/user.repository.ts";

const userRepository = createUserRepository();

export const profileRoutes = new Hono()
  .get("/profile", requireAuth, async (c) => {
    const profile = await userRepository.findProfileByUserId(c.get("userId"));

    return c.json({ profile });
  })
  .patch("/profile", requireAuth, async (c) => {
    const input = UpdateProfileRequestSchema.parse(await c.req.json());
    const profile = await userRepository.updateProfile(c.get("userId"), input);

    return c.json({ profile });
  });
