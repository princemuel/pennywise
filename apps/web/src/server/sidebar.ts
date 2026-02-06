"use server";

import { getUserPrefs, setUserPrefs } from "@/lib/cookies";
import { createServerFn } from "@tanstack/react-start";

export const toggleSidebar = createServerFn({ method: "POST" }, async (formData: FormData) => {
  const mini = formData.get("mini") === "true";
  const values = await getUserPrefs();
  await setUserPrefs({ ...values, mini });
  return { success: true };
});
