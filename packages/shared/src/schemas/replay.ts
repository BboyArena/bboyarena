import { z } from "zod";

export const ReplaySchema = z.object({
  id: z.string(),
  userId: z.string(),
  scoreId: z.string(),
  dataUrl: z.string(),
  createdAt: z.string(),
});

export const CreateReplayRequestSchema = z.object({
  scoreId: z.string(),
  dataUrl: z.string(),
});
