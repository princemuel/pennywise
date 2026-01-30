"use server";

import { getUserPrefs, setUserPrefs } from "@/lib/cookies";

export async function toggleSidebar(formData: FormData) {
  const minimize = formData.get("minimize") === "true";
  const values = await getUserPrefs();
  await setUserPrefs({ ...values, minimize });
}
