import { secs } from "@/helpers/time";
import { cookies } from "next/headers";

export async function getUserPrefs(): Promise<Record<string, unknown>> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user-prefs")?.value;
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : { minimize: false };
}

export async function setUserPrefs(values: unknown) {
  const cookieStore = await cookies();
  cookieStore.set("user-prefs", JSON.stringify(values), { maxAge: secs({ d: 7 }) });
}
