import { tw } from "@/helpers/tailwind";
import type { ComponentProps } from "react";

type Props = ComponentProps<"div">;

export const Container = ({ children, className, ...rest }: Props) => {
  return (
    <div
      className={tw([
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        "3xl:max-w-screen-3xl max-w-screen-lg lg:max-w-screen-2xl",
        className,
      ])}
      {...rest}
    >
      {children}
    </div>
  );
};
