import type { ComponentProps } from "react";

type Props = ComponentProps<"main">;

export const MainContent = ({ children, ...rest }: Props) => {
  return (
    <main id="main" aria-labelledby="heading" {...rest}>
      {children}
    </main>
  );
};
