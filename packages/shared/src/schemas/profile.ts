import { z } from "zod";

export const ProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().min(1),
  crew: z.string().nullable(),
  country: z.string().nullable(),
});

export const UpdateProfileRequestSchema = z.object({
  displayName: z.string().min(1).optional(),
  crew: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});
