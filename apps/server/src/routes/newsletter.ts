import { Hono } from "hono";
import type { Context } from "hono";
import {
  NewsletterSubscribeRequestSchema,
  NewsletterUnsubscribeRequestSchema,
} from "@bboyarena/shared/schemas";
import { createConsentRepository } from "../repositories/consent.repository.ts";
import { createNewsletterRepository } from "../repositories/newsletter.repository.ts";
import { createEmailService } from "../services/email.service.ts";
import { createNewsletterService } from "../services/newsletter.service.ts";

const newsletterService = createNewsletterService({
  consentRepository: createConsentRepository(),
  emailService: createEmailService(),
  newsletterRepository: createNewsletterRepository(),
});

const getMetadata = (c: Context) => ({
  ipAddress: c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
  source: "website" as const,
  userAgent: c.req.header("user-agent"),
});

export const newsletterRoutes = new Hono()
  .post("/newsletter/subscribe", async (c) => {
    const input = NewsletterSubscribeRequestSchema.parse(await c.req.json());
    const result = await newsletterService.subscribe(input, getMetadata(c));

    return c.json(result, 201);
  })
  .post("/newsletter/unsubscribe", async (c) => {
    const input = NewsletterUnsubscribeRequestSchema.parse(await c.req.json());
    const result = await newsletterService.unsubscribe(input);

    return c.json(result);
  })
  .get("/newsletter/status", async (c) => {
    const email = c.req.query("email");

    if (!email) {
      return c.json({ error: "MISSING_EMAIL" }, 400);
    }

    const status = await newsletterService.getStatus(email);

    return c.json({ status });
  });
