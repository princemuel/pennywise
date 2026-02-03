import { secs } from "@/helpers/time";
import { cookies } from "next/headers";

type JSONValue = string | number | boolean | null;

export async function getUserPrefs() {
  const cookieStore = await cookies();
  const userPrefs = cookieStore.get("user-prefs")?.value;
  return userPrefs ? (JSON.parse(userPrefs) as Record<string, JSONValue>) : { minimize: false };
}

export async function setUserPrefs(values: unknown) {
  const cookieStore = await cookies();
  cookieStore.set("user-prefs", JSON.stringify(values), { maxAge: secs({ d: 7 }) });
}
