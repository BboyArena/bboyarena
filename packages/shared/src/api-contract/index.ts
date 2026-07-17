import type {
  AuthSession,
  CreateReplayRequest,
  LoginRequest,
  Profile,
  Replay,
  RegisterRequest,
  Score,
  SubmitScoreRequest,
  UpdateProfileRequest,
  User,
} from "../types/index.ts";

export type ApiContract = {
  "GET /api/me": {
    response: { user: User };
  };
  "POST /api/login": {
    body: LoginRequest;
    response: AuthSession;
  };
  "POST /api/register": {
    body: RegisterRequest;
    response: AuthSession;
  };
  "POST /api/logout": {
    response: { ok: true };
  };
  "GET /api/profile": {
    response: { profile: Profile };
  };
  "PATCH /api/profile": {
    body: UpdateProfileRequest;
    response: { profile: Profile };
  };
  "GET /api/leaderboard": {
    response: { leaderboard: Score[] };
  };
  "POST /api/scores": {
    body: SubmitScoreRequest;
    response: { score: Score };
  };
  "GET /api/replays/:id": {
    response: { replay: Replay };
  };
  "POST /api/replays": {
    body: CreateReplayRequest;
    response: { replay: Replay };
  };
};
