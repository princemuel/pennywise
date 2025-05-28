// eslint-disable prefer-spread
// eslint-disable init-declarations

import { getErrorMessage } from "@/helpers/error";
import { isBrowser } from "@/utils/guards";

/**
 * Cross-platform hash function that works in both browser and Node.js environments
 * @param data The string to hash
 * @returns The hex-encoded hash value
 */
export const hash = async (data: string): Promise<string> => {
  if (isBrowser && globalThis.crypto && globalThis.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(data);
      const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      throw new Error(`Browser hashing error: ${getErrorMessage(error)}`);
    }
  } else if ("undefined" !== typeof process && process.versions && process.versions.node) {
    try {
      const crypto = await import("node:crypto");
      return crypto.createHash("sha256").update(data).digest("hex");
    } catch (error) {
      throw new Error(`Node.js hashing error: ${getErrorMessage(error)}`);
    }
  } else {
    throw new Error("Current environment is neither browser nor Node.js");
  }
};
