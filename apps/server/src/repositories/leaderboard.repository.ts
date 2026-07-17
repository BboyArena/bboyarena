import type { Score, SubmitScoreRequest } from "@bboyarena/shared/types";
import { collections } from "../adapters/pocketbase/collections.ts";
import { getPocketBaseClient } from "../adapters/pocketbase/client.ts";

export type LeaderboardRepository = {
  list(): Promise<Score[]>;
  createScore(userId: string, input: SubmitScoreRequest): Promise<Score>;
};

export const createLeaderboardRepository = (): LeaderboardRepository => {
  const pb = getPocketBaseClient();

  return {
    list: async () => [],
    createScore: async (userId, input) => {
      void pb;
      void collections.scores;

      return {
        id: "stub-score-id",
        userId,
        value: input.value,
        mode: input.mode,
        createdAt: new Date().toISOString(),
      };
    },
  };
};
