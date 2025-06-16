import * as fs from "node:fs";

import { Temporal } from "@js-temporal/polyfill";

interface CacheEntry {
  exists: boolean;
  timestamp: Temporal.Instant;
}

export class LRUFileCache {
  #cache = new Map<string, CacheEntry>();
  #maxSize: number;
  #duration: Temporal.Duration;

  constructor(maxSize = 24, duration = Temporal.Duration.from({ hours: 1 })) {
    this.#maxSize = maxSize;
    this.#duration = Temporal.Duration.from(duration);
  }

  exists(filePath: string): boolean {
    const now = Temporal.Now.instant();
    const cached = this.#cache.get(filePath);

    if (
      cached &&
      now.since(cached.timestamp).total({ unit: "seconds" }) <
        this.#duration.total({ unit: "seconds" })
    ) {
      this.#cache.delete(filePath);
      this.#cache.set(filePath, cached);
      return cached.exists;
    }

    const exists = fs.existsSync(filePath);

    if (this.#cache.size >= this.#maxSize)
      this.#cache.delete(this.#cache.keys().next().value ?? "");

    this.#cache.set(filePath, { exists, timestamp: now });
    return exists;
  }
}
