import type { ComponentProps } from "react";

type Props = ComponentProps<"main">;

export const Main = ({ children, ...rest }: Props) => {
  return (
    <main id="main-content" aria-labelledby="heading" {...rest}>
      {children}
    </main>
  );
};
