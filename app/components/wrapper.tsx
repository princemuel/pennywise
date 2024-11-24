import { tw } from "@/helpers/tailwind";

export function Wrapper({
  children,
  className,
  ...attrs
}: React.ComponentProps<"div">) {
  return (
    <div
      {...attrs}
      className={tw([
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        "3xl:max-w-screen-3xl max-w-screen-lg lg:max-w-screen-2xl",
        className,
      ])}
    >
      {children}
    </div>
  );
}
