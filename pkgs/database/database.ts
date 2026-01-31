// SPDX-License-Identifier: Apache-2.0
import "@dotenvx/dotenvx/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "./prisma/client";

const client = globalThis as typeof globalThis & { db?: PrismaClient };
const production = process.env.NODE_ENV === "production";
const adapter = new PrismaLibSql({
  url: `${process.env.DATABASE_URL}`,
  authToken: `${process.env.DATABASE_TOKEN}`,
});

export const db = client.db ?? new PrismaClient({ adapter });
if (!production) client.db = db;
process.on("beforeExit", () => void db.$disconnect());
