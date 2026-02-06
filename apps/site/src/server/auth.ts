"use server";

import { SignInSchema, SignUpSchema } from "@/schema/auth";
import { parseWithZod } from "@conform-to/zod/v4";
import { createServerFn } from "@tanstack/react-start";

export const signin = createServerFn({ method: "POST" }, async (formData: FormData) => {
  const submission = parseWithZod(formData, { schema: SignInSchema });
  if (submission.status !== "success") return submission.reply();
  // TODO: Implement actual authentication logic
  return { success: true };
});

export const signup = createServerFn({ method: "POST" }, async (formData: FormData) => {
  const submission = parseWithZod(formData, { schema: SignUpSchema });
  if (submission.status !== "success") return submission.reply();
  // TODO: Implement actual registration logic
  return { success: true };
});
