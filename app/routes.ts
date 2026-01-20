import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("./routes/_auth/route.tsx", [
    route("signin", "./routes/_auth/signin.tsx"),
    route("signup", "./routes/_auth/signup.tsx"),
  ]),

  layout("./routes/_dashboard/route.tsx", [
    index("./routes/_dashboard/_index.tsx"),
    ...prefix("bills", [index("./routes/_dashboard/bills.tsx")]),
    ...prefix("budgets", [index("./routes/_dashboard/budgets.tsx")]),
    ...prefix("pots", [index("./routes/_dashboard/pots.tsx")]),
    ...prefix("transactions", [index("./routes/_dashboard/transactions.tsx")]),
  ]),
] satisfies RouteConfig;
