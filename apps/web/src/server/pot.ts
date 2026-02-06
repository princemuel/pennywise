"use server";

import { createServerFn } from "@tanstack/react-start";

export const destroyPot = createServerFn(
  { method: "POST" },
  async (id: string, formData: FormData) => {
    const json = (await import("@/lib/data")).default;
    const idx = json.pots.findIndex((pot: any) => pot.id === id);
    if (idx === -1) return { ok: false, error: "Pot not found" };
    json.pots.splice(idx, 1);
    return { ok: true };
  },
);
