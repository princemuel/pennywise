declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.svg?react" {
  import * as React from "react";
  const content: React.FunctionComponent<
    React.ComponentProps<"svg"> & {
      title?: string;
      titleId?: string;
      desc?: string;
      descId?: string;
    }
  >;

  export default content;
}
