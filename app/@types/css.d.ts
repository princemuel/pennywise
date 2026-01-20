import "react";

declare module "react" {
  interface CSSProperties {
    [index: `--theme-${string}`]: any;
    [index: `--${string}`]: any;
    [index: string]: any;
  }
}
