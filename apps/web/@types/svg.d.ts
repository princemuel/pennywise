declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.svg?react" {
  import * as React from "react";
  const content: React.FunctionComponent<React.ComponentProps<"svg">>;
  export default content;
}
