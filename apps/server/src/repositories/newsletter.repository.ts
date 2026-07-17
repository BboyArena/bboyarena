import { collections } from "../adapters/pocketbase/collections.ts";
import { getPocketBaseClient } from "../adapters/pocketbase/client.ts";

export type NewsletterSubscriptionStatus = "none" | "subscribed" | "unsubscribed";

export type NewsletterRepository = {
  getStatus(email: string): Promise<NewsletterSubscriptionStatus>;
  subscribe(input: { email: string; source: "website" | "game" | "api"; userId?: string }): Promise<void>;
  unsubscribe(email: string): Promise<void>;
};

export const createNewsletterRepository = (): NewsletterRepository => {
  const pb = getPocketBaseClient();

  const findByEmail = async (email: string) => {
    try {
      return await pb.collection(collections.newsletterSubscriptions).getFirstListItem(`email="${email}"`);
    } catch {
      return null;
    }
  };

  return {
    getStatus: async (email) => {
      const subscription = await findByEmail(email);

      return subscription?.status === "subscribed" ? "subscribed" : subscription ? "unsubscribed" : "none";
    },
    subscribe: async ({ email, source, userId }) => {
      const subscription = await findByEmail(email);

      if (subscription) {
        await pb.collection(collections.newsletterSubscriptions).update(subscription.id, {
          status: "subscribed",
          source,
          unsubscribedAt: "",
        });
        return;
      }

      await pb.collection(collections.newsletterSubscriptions).create({
        consentVersion: "2026-07-16",
        email,
        source,
        status: "subscribed",
        user: userId,
      });
    },
    unsubscribe: async (email) => {
      const subscription = await findByEmail(email);

      if (!subscription) {
        return;
      }

      await pb.collection(collections.newsletterSubscriptions).update(subscription.id, {
        status: "unsubscribed",
        unsubscribedAt: new Date().toISOString(),
      });
    },
  };
};
