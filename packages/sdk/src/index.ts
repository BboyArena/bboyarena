import type {
  AuthSession,
  LoginRequest,
  RegisterRequest,
  Replay,
  Score,
  SubmitScoreRequest,
  User,
} from "@bboyarena/shared/types";

export type BboyArenaSdkOptions = {
  baseUrl: string;
  getToken?: () => string | null | undefined;
};

export const createBboyArenaSdk = ({ baseUrl, getToken }: BboyArenaSdkOptions) => {
  const request = async <TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> => {
    const token = getToken?.();
    const headers = new Headers(init.headers);

    headers.set("content-type", "application/json");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      throw new Error(`BboyArena API request failed: ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
  };

  return {
    login: (input: LoginRequest) =>
      request<AuthSession>("/api/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    register: (input: RegisterRequest) =>
      request<AuthSession>("/api/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    logout: () =>
      request<{ ok: true }>("/api/logout", {
        method: "POST",
      }),
    getMe: () => request<{ user: User }>("/api/me"),
    submitScore: (input: SubmitScoreRequest) =>
      request<{ score: Score }>("/api/scores", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    getLeaderboard: () => request<{ leaderboard: Score[] }>("/api/leaderboard"),
    getReplay: (id: string) => request<{ replay: Replay }>(`/api/replays/${id}`),
  };
};

export type BboyArenaSdk = ReturnType<typeof createBboyArenaSdk>;
