import { z } from "zod";

export const SignInSchema = z.object({ email: z.email(), password: z.string() });

export const SignUpSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
});
