"use client";

import { tw } from "@/helpers/tailwind";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type Props = React.ComponentPropsWithRef<"dialog">;

export const Dialog = ({ className, children, ...attrs }: Props) => {
  const router = useRouter();

  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      closedby="any"
      aria-modal="true"
      {...attrs}
      onClose={() => router.back()}
      ref={ref}
      className={tw([
        "mx-4 my-auto max-w-xl rounded-xl bg-white p-8 shadow-xl backdrop:pointer-events-auto backdrop:bg-grey-900/50 sm:mx-auto",
        className,
      ])}
    >
      <section className="flex flex-col gap-6">{children}</section>
    </dialog>
  );
};

//  <dialog
//       ref={ref}
//       onClose={handleClose}
//       className={twMerge(
//         `
//         w-[90vw]
//         max-w-lg
//         max-h-[90vh]
//         overflow-hidden

//         rounded-xl
//         border
//         border-zinc-200
//         bg-white
//         p-0
//         shadow-xl

//         backdrop:bg-black/40

//         data-[state=closing]:animate-out
//         data-[state=closing]:fade-out
//         data-[state=closing]:zoom-out-95

//         motion-safe:animate-in
//         motion-safe:fade-in
//         motion-safe:zoom-in-95
//         `,
//         className
//       )}
//     >
//       {children}
//     </dialog>
