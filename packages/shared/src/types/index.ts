import type { z } from "zod";
import type {
  AuthSessionSchema,
  LoginRequestSchema,
  NewsletterSubscribeRequestSchema,
  NewsletterUnsubscribeRequestSchema,
  ProfileSchema,
  RegisterRequestSchema,
  ReplaySchema,
  ScoreSchema,
  SubmitScoreRequestSchema,
  UpdateProfileRequestSchema,
  UserSchema,
  CreateReplayRequestSchema,
} from "../schemas/index.ts";

export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Score = z.infer<typeof ScoreSchema>;
export type Replay = z.infer<typeof ReplaySchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type NewsletterSubscribeRequest = z.infer<typeof NewsletterSubscribeRequestSchema>;
export type NewsletterUnsubscribeRequest = z.infer<typeof NewsletterUnsubscribeRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type SubmitScoreRequest = z.infer<typeof SubmitScoreRequestSchema>;
export type CreateReplayRequest = z.infer<typeof CreateReplayRequestSchema>;
