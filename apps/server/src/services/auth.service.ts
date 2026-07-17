import type { LoginRequest, RegisterRequest } from "@bboyarena/shared/types";
import type { AuthRepository, RegisterMetadata } from "../repositories/auth.repository.ts";

export const createAuthService = (authRepository: AuthRepository) => ({
  login: (input: LoginRequest) => authRepository.login(input),
  register: (input: RegisterRequest, metadata: RegisterMetadata) => authRepository.register(input, metadata),
  authenticateToken: (token: string) => authRepository.authenticateToken(token),
  logout: () => authRepository.logout(),
});
