import { DATABASE_TOKEN, DATABASE_URL } from "@/config/env.server";
import { remember } from "@/helpers/singleton";

import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const libsql = createClient({ url: DATABASE_URL, authToken: DATABASE_TOKEN });
const adapter = new PrismaLibSQL(libsql);

export const db = remember("__db__", () => new PrismaClient({ adapter }));
