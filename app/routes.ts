import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

export default [
  layout("./routes/_auth.tsx", [
    route("login", "./routes/_auth.login.tsx"),
    route("register", "./routes/_auth.register.tsx"),
  ]),
  layout("components/shell.tsx", [index("./routes/_dashboard._index.tsx")]),
  // ...prefix("api", [
  //   route("theme", "./routes/api/theme.ts"),
  //   route("delete", "./routes/api/delete.ts"),
  //   route("toggle", "./routes/api/toggle.ts"),
  // ]),
] satisfies RouteConfig;
