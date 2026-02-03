"use server";

import { getUserPrefs, setUserPrefs } from "@/lib/cookies";

export async function toggleSidebar(formData: FormData) {
  const mini = formData.get("mini") === "true";
  const values = await getUserPrefs();
  await setUserPrefs({ ...values, mini });
}
