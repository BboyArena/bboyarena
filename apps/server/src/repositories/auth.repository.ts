import type { AuthSession, LoginRequest, RegisterRequest } from "@bboyarena/shared/types";
import { createPocketBaseAuthAdapter } from "../adapters/pocketbase/auth.ts";

export type RegisterMetadata = {
  ipAddress?: string;
  source: "website" | "game" | "api";
  userAgent?: string;
};

export type AuthRepository = {
  login(input: LoginRequest): Promise<AuthSession>;
  register(input: RegisterRequest, metadata: RegisterMetadata): Promise<AuthSession>;
  authenticateToken(token: string): Promise<AuthSession>;
  logout(): Promise<void>;
};

export const createAuthRepository = (): AuthRepository => {
  const authAdapter = createPocketBaseAuthAdapter();

  return {
    login: (input) => authAdapter.loginWithPassword(input.email, input.password),
    register: (input, metadata) => authAdapter.registerWithPassword(input, metadata),
    authenticateToken: (token) => authAdapter.authenticateToken(token),
    logout: () => authAdapter.logout(),
  };
};
