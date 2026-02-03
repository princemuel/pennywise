"use client";

import { useEffect, useRef } from "react";

type Props = React.ComponentPropsWithRef<"dialog">;

export const Dialog = ({ className, children, ...attrs }: Props) => {
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
      // eslint-disable-next-line react/no-unknown-property
      closedby="any"
      aria-modal="true"
      {...attrs}
      ref={ref}
      className={className}
    >
      {children}
    </dialog>
  );
};
