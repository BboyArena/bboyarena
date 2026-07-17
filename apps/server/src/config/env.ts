import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  POCKETBASE_URL: z.url().default("http://127.0.0.1:8090"),
  JWT_SECRET: z.string().min(16).default("dev-only-change-this-secret"),
  EMAIL_PROVIDER: z.enum(["noop", "resend", "brevo"]).default("noop"),
  EMAIL_FROM: z.email().default("noreply@bboyarena.org"),
  EMAIL_REPLY_TO: z.email().optional(),
  RESEND_API_KEY: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
});

export const config = envSchema.parse(process.env);

export type AppConfig = typeof config;
