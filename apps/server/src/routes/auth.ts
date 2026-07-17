import { Hono } from "hono";
import { LoginRequestSchema, RegisterRequestSchema } from "@bboyarena/shared/schemas";
import { createAuthRepository } from "../repositories/auth.repository.ts";
import { createAuthService } from "../services/auth.service.ts";

const authService = createAuthService(createAuthRepository());

export const authRoutes = new Hono()
  .post("/register", async (c) => {
    const input = RegisterRequestSchema.parse(await c.req.json());
    const result = await authService.register(input, {
      ipAddress: c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
      source: "website",
      userAgent: c.req.header("user-agent"),
    });

    return c.json(result, 201);
  })
  .post("/login", async (c) => {
    const input = LoginRequestSchema.parse(await c.req.json());
    const result = await authService.login(input);

    return c.json(result);
  })
  .post("/logout", async (c) => {
    await authService.logout();

    return c.json({ ok: true });
  });
