import { type CnOptions, cn } from "tailwind-variants";

export const tw = <T extends CnOptions>(...classes: T) => cn(...classes);
