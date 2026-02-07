import { createHash } from "node:crypto";

import data from "$lib/content/db.json";

const db = {
  ...data,
  pots: data.pots.map((pot) =>
    Object.assign(pot, {
      id: createHash("sha1").update(pot.name).digest("hex").slice(0, 6),
      percent: (pot.total / pot.target) * 100
    })
  )
};

export default db;
