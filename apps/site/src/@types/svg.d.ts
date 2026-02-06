declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.svg?react" {
  import type { SVGProps } from "react";

  const content: React.FC<SVGProps<SVGSVGElement>>;
  export default content;
}
