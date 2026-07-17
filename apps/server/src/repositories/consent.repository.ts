import { collections } from "../adapters/pocketbase/collections.ts";
import { getPocketBaseClient } from "../adapters/pocketbase/client.ts";

export type ConsentRepository = {
  recordNewsletterConsent(input: {
    accepted: boolean;
    email: string;
    source: "website" | "game" | "api";
    userAgent?: string;
    ipAddress?: string;
    userId?: string;
  }): Promise<void>;
};

export const createConsentRepository = (): ConsentRepository => {
  const pb = getPocketBaseClient();

  return {
    recordNewsletterConsent: async (input) => {
      await pb.collection(collections.userConsents).create({
        accepted: input.accepted,
        documentType: "newsletter",
        documentVersion: "2026-07-16",
        email: input.email,
        ipAddress: input.ipAddress ?? "",
        source: input.source,
        user: input.userId,
        userAgent: input.userAgent ?? "",
      });
    },
  };
};
