import { z } from "zod";

export const ScoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  value: z.number().int().nonnegative(),
  mode: z.string().min(1),
  createdAt: z.string(),
});

export const SubmitScoreRequestSchema = z.object({
  value: z.number().int().nonnegative(),
  mode: z.string().min(1),
});
