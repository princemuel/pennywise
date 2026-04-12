import type z from "zod";

type Result<T, E = string> = { data: T; error: null } | { data: null; error: E };
type ErrorFormatter = (error: z.ZodError) => string;

export function parse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  formatError?: ErrorFormatter
): Result<z.infer<T>> {
  const result = schema.safeParse(data);

  if (result.success) return { data: result.data, error: null };

  const message = formatError
    ? formatError(result.error)
    : result.error.issues.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");

  return { data: null, error: message };
}
