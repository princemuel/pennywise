import { z } from "zod";

export const schema = z.object({
  name: z.string().trim().min(2).max(56),
  email: z.email("Please enter a valid email.").trim(),
  password: z.string().trim().min(8).max(32),
  fruit: z.literal("").optional()
});
