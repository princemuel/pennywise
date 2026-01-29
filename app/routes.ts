import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("./routes/_auth/route.tsx", [
    route("signin", "./routes/_auth/signin.tsx"),
    route("signup", "./routes/_auth/signup.tsx"),
  ]),

  ...prefix("_actions", [route("sidebar", "./routes/_actions/sidebar.ts")]),

  layout("./routes/_dashboard/route.tsx", [
    index("./routes/_dashboard/_index.tsx"),
    ...prefix("bills", [index("./routes/_dashboard/bills.tsx")]),
    ...prefix("budgets", [index("./routes/_dashboard/budgets.tsx")]),
    ...prefix("pots", [
      layout("./routes/_dashboard/pots/route.tsx", [
        index("./routes/_dashboard/pots/_index.tsx"),
        route(":id/edit", "./routes/_dashboard/pots/$id.edit.tsx"),
        route(":id/delete", "./routes/_dashboard/pots/$id.delete.tsx"),
      ]),
    ]),
    ...prefix("transactions", [index("./routes/_dashboard/transactions.tsx")]),
  ]),
] satisfies RouteConfig;
