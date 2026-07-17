import type {
  NewsletterSubscribeRequest,
  NewsletterUnsubscribeRequest,
} from "@bboyarena/shared/types";
import type { ConsentRepository } from "../repositories/consent.repository.ts";
import type { NewsletterRepository } from "../repositories/newsletter.repository.ts";
import type { createEmailService } from "./email.service.ts";

export type NewsletterMetadata = {
  ipAddress?: string;
  source: "website" | "game" | "api";
  userAgent?: string;
  userId?: string;
};

export const createNewsletterService = ({
  consentRepository,
  emailService,
  newsletterRepository,
}: {
  consentRepository: ConsentRepository;
  emailService: ReturnType<typeof createEmailService>;
  newsletterRepository: NewsletterRepository;
}) => ({
  getStatus: (email: string) => newsletterRepository.getStatus(email),
  subscribe: async (input: NewsletterSubscribeRequest, metadata: NewsletterMetadata) => {
    await consentRepository.recordNewsletterConsent({
      accepted: true,
      email: input.email,
      ipAddress: metadata.ipAddress,
      source: metadata.source,
      userAgent: metadata.userAgent,
      userId: metadata.userId,
    });
    await newsletterRepository.subscribe({
      email: input.email,
      source: metadata.source,
      userId: metadata.userId,
    });
    await emailService.send({
      subject: "Welcome to BboyArena updates",
      text: "You are subscribed to BboyArena project updates.",
      to: input.email,
    });

    return { ok: true as const };
  },
  unsubscribe: async (input: NewsletterUnsubscribeRequest) => {
    await newsletterRepository.unsubscribe(input.email);

    return { ok: true as const };
  },
});
