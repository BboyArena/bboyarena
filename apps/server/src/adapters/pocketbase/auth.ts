import type { AuthSession, RegisterRequest } from "@bboyarena/shared/types";
import type { RecordModel } from "pocketbase";
import { AppError } from "../../errors.ts";
import type { RegisterMetadata } from "../../repositories/auth.repository.ts";
import { collections } from "./collections.ts";
import { getPocketBaseClient } from "./client.ts";

const mapPocketBaseUser = (record: RecordModel) => ({
  id: record.id,
  email: typeof record.email === "string" ? record.email : "",
  username:
    typeof record.username === "string" && record.username.length > 0
      ? record.username
      : typeof record.name === "string" && record.name.length > 0
        ? record.name
        : record.id,
  createdAt: record.created,
});

export const createPocketBaseAuthAdapter = () => {
  const pb = getPocketBaseClient();

  const createConsentRecord = async ({
    accepted,
    documentType,
    documentVersion,
    metadata,
    userId,
  }: {
    accepted: boolean;
    documentType: "privacy_policy" | "terms" | "newsletter";
    documentVersion: string;
    metadata: RegisterMetadata;
    userId: string;
  }) => {
    await pb.collection(collections.userConsents).create({
      accepted,
      documentType,
      documentVersion,
      ipAddress: metadata.ipAddress ?? "",
      source: metadata.source,
      user: userId,
      userAgent: metadata.userAgent ?? "",
    });
  };

  return {
    loginWithPassword: async (email: string, password: string): Promise<AuthSession> => {
      try {
        const auth = await pb
          .collection(collections.users)
          .authWithPassword<RecordModel>(email, password);

        return {
          token: auth.token,
          user: mapPocketBaseUser(auth.record),
        };
      } catch {
        throw new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password");
      }
    },
    registerWithPassword: async (
      input: RegisterRequest,
      metadata: RegisterMetadata,
    ): Promise<AuthSession> => {
      try {
        await pb.collection(collections.users).create({
          email: input.email,
          name: input.username,
          password: input.password,
          passwordConfirm: input.passwordConfirm,
          username: input.username,
        });

        const auth = await pb
          .collection(collections.users)
          .authWithPassword<RecordModel>(input.email, input.password);
        const currentUsername =
          typeof auth.record.username === "string" && auth.record.username.length > 0
            ? auth.record.username
            : typeof auth.record.name === "string" && auth.record.name.length > 0
              ? auth.record.name
              : "";

        if (currentUsername !== input.username) {
          const record = await pb.collection(collections.users).update<RecordModel>(auth.record.id, {
            name: input.username,
            username: input.username,
          });

          auth.record = record;
        }

        await createConsentRecord({
          accepted: input.privacyPolicyAccepted,
          documentType: "privacy_policy",
          documentVersion: "2026-07-16",
          metadata,
          userId: auth.record.id,
        });
        await createConsentRecord({
          accepted: input.termsAccepted,
          documentType: "terms",
          documentVersion: "2026-07-16",
          metadata,
          userId: auth.record.id,
        });

        if (input.newsletterOptIn) {
          await createConsentRecord({
            accepted: true,
            documentType: "newsletter",
            documentVersion: "2026-07-16",
            metadata,
            userId: auth.record.id,
          });
          await pb.collection(collections.newsletterSubscriptions).create({
            consentVersion: "2026-07-16",
            email: input.email,
            source: metadata.source,
            status: "subscribed",
            user: auth.record.id,
          });
        }

        return {
          token: auth.token,
          user: mapPocketBaseUser(auth.record),
        };
      } catch {
        throw new AppError("REGISTRATION_FAILED", 400, "Unable to create account");
      }
    },
    authenticateToken: async (token: string): Promise<AuthSession> => {
      try {
        pb.authStore.save(token, null);

        const auth = await pb.collection(collections.users).authRefresh<RecordModel>();

        return {
          token: auth.token,
          user: mapPocketBaseUser(auth.record),
        };
      } catch {
        throw new AppError("UNAUTHORIZED", 401, "Invalid or expired token");
      }
    },
    logout: async () => {
      pb.authStore.clear();
    },
  };
};
