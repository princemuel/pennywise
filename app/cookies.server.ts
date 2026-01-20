import { secs } from "@/helpers/time";
import { createCookie } from "react-router";

export const userPrefs = createCookie("user-prefs", { maxAge: secs({ d: 7 }) });
