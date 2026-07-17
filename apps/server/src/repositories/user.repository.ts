import type { Profile, UpdateProfileRequest, User } from "@bboyarena/shared/types";
import { collections } from "../adapters/pocketbase/collections.ts";
import { getPocketBaseClient } from "../adapters/pocketbase/client.ts";

export type UserRepository = {
  findById(id: string): Promise<User>;
  findProfileByUserId(userId: string): Promise<Profile>;
  updateProfile(userId: string, input: UpdateProfileRequest): Promise<Profile>;
};

export const createUserRepository = (): UserRepository => {
  const pb = getPocketBaseClient();

  return {
    findById: async (id) => {
      const record = await pb.collection(collections.users).getOne(id);

      return {
        id: record.id,
        email: typeof record.email === "string" ? record.email : "",
        username: typeof record.username === "string" ? record.username : record.id,
        createdAt: record.created,
      };
    },
    findProfileByUserId: async (userId) => ({
      userId,
      displayName: "Stub Player",
      crew: null,
      country: null,
    }),
    updateProfile: async (userId, input) => ({
      userId,
      displayName: input.displayName ?? "Stub Player",
      crew: input.crew ?? null,
      country: input.country ?? null,
    }),
  };
};
