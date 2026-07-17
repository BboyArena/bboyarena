import { z } from "zod";
import { UserSchema } from "./user.ts";

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const RegisterRequestSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
    username: z.string().min(3).max(32),
    privacyPolicyAccepted: z.literal(true),
    termsAccepted: z.literal(true),
    newsletterOptIn: z.boolean().default(false),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export const AuthSessionSchema = z.object({
  token: z.string(),
  user: UserSchema,
});
