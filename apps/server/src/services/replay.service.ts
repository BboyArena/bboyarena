import type { CreateReplayRequest, Replay } from "@bboyarena/shared/types";

export const createReplayService = () => ({
  getReplay: async (id: string): Promise<Replay> => ({
    id,
    userId: "stub-user-id",
    scoreId: "stub-score-id",
    dataUrl: "",
    createdAt: new Date().toISOString(),
  }),
  createReplay: async (userId: string, input: CreateReplayRequest): Promise<Replay> => ({
    id: "stub-replay-id",
    userId,
    scoreId: input.scoreId,
    dataUrl: input.dataUrl,
    createdAt: new Date().toISOString(),
  }),
});
