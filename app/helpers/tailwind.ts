import type { CnOptions } from "tailwind-variants";
// eslint-disable-next-line
import { cn as cx } from "tailwind-variants";

export const cn = (...args: CnOptions) => cx(...args)({ twMerge: true });
