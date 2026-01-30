import { SignInSchema, SignUpSchema } from "@/schema/auth";
import { parseWithZod } from "@conform-to/zod";

export async function signin(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: SignInSchema });
  if (submission.status !== "success") return submission.reply();
}
export async function signup(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: SignUpSchema });
  if (submission.status !== "success") return submission.reply();
}
