import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  username: z.string().min(1),
  createdAt: z.string(),
});
