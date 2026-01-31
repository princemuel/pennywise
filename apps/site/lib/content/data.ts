import database from "@/lib/content/db.json";
import { createHash } from "node:crypto";

const data = {
  ...database,
  pots: database.pots.map((pot) =>
    Object.assign(pot, {
      id: createHash("sha1").update(pot.name).digest("hex").slice(0, 6),
      percent: (pot.total / pot.target) * 100,
    }),
  ),
};

export default data;
