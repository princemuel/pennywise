import { PrismaClient } from "@prisma/client";

import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from "@/config/env.server";
import { remember } from "@/helpers/singleton";
import { createClient } from "@libsql/client";
// 1. Import libSQL and the Prisma libSQL driver adapter
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// 2. Instantiate libSQL
const libsql = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});
// 3. Instantiate the libSQL driver adapter
const adapter = new PrismaLibSQL(libsql);

// 4. Pass the adapter option to the Prisma Client instance
export const db = remember("__db__", () => new PrismaClient({ adapter }));
