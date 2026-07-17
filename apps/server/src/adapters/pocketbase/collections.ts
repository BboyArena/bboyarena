export const collections = {
  users: "users",
  profiles: "profiles",
  scores: "scores",
  replays: "replays",
  privacyDocuments: "privacy_documents",
  userConsents: "user_consents",
  newsletterSubscriptions: "newsletter_subscriptions",
} as const;

export type PocketBaseCollection = (typeof collections)[keyof typeof collections];
