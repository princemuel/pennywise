import { tw } from "@/helpers/tailwind";

import { Dialog } from "@repo/ui/dialog";

type Props = React.ComponentProps<"dialog">;

export function Modal({ children, className, ...attrs }: Props) {
  return (
    <Dialog
      {...attrs}
      className={tw([
        "mx-4 my-auto max-w-xl rounded-xl bg-white p-8 shadow-xl backdrop:pointer-events-auto backdrop:bg-grey-900/50 sm:mx-auto",
        className,
      ])}
    >
      <section className="flex flex-col gap-6">{children}</section>
    </Dialog>
  );
}
