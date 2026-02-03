"use server";

export async function destroyPot(id: string, _: FormData) {
  const json = (await import("@/lib/data")).default;
  const idx = json.pots.findIndex((pot) => pot.id === id);
  if (idx === -1) return { ok: false, error: "Pot not found" };
  json.pots.splice(idx, 1);
}
