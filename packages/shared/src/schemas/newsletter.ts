import { z } from "zod";

export const NewsletterSubscribeRequestSchema = z.object({
  email: z.email(),
  privacyPolicyAccepted: z.literal(true),
  newsletterOptIn: z.literal(true),
});

export const NewsletterUnsubscribeRequestSchema = z.object({
  email: z.email(),
});
