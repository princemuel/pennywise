import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

import { LRUFileCache } from "@/helpers/file-cache";
import { handleApi } from "@/helpers/route-handler";

export const prerender = false;

const FILENAME = "ne_110m_admin_0_countries.geojson.json";

const FILE_STRATEGIES = new Map([
  [
    "br",
    {
      encoding: "br",
      test: (enc: string) => enc.includes("br"),
      filename: `${FILENAME}.br`,
    },
  ],
  [
    "gzip",
    {
      encoding: "gzip",
      test: (enc) => enc.includes("gzip") || enc.includes("*"),
      filename: `${FILENAME}.gz`,
    },
  ],
  ["", { encoding: null, test: () => true, filename: FILENAME }],
]);

const fileCache = new LRUFileCache();

export const GET = handleApi(async ({ request }) => {
  const selectFileStrategy = (encoding = "") => {
    const DATA_DIR = join(cwd(), "content", "resources");
    for (const [_, strategy] of FILE_STRATEGIES) {
      const filePath = join(DATA_DIR, strategy.filename);

      if (strategy.test(encoding) && fileCache.exists(filePath))
        return { ...strategy, filePath };
    }

    return { filename: FILENAME, filePath: join(DATA_DIR, FILENAME), encoding: null };
  };

  const strategy = selectFileStrategy(request.headers.get("accept-encoding") ?? "");

  if (!fileCache.exists(strategy.filePath))
    return new Response(null, { status: 404, statusText: "Not found" });

  const buffer = await readFile(strategy.filePath);

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=86400",
    Vary: "Accept-Encoding",
    "Content-Length": buffer.length.toString(),
  });

  if (strategy.encoding) headers.set("Content-Encoding", strategy.encoding);

  return new Response(buffer, { status: 200, headers });
});
