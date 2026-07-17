import type { SubmitScoreRequest } from "@bboyarena/shared/types";
import type { LeaderboardRepository } from "../repositories/leaderboard.repository.ts";

export const createLeaderboardService = (leaderboardRepository: LeaderboardRepository) => ({
  getLeaderboard: () => leaderboardRepository.list(),
  submitScore: (userId: string, input: SubmitScoreRequest) =>
    leaderboardRepository.createScore(userId, input),
});
