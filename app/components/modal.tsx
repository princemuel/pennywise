import { tw } from "@/helpers/tailwind";

interface Props extends React.ComponentProps<"dialog"> {}

export function Modal({ children, className, ...attrs }: Props) {
  return (
    <dialog closedby="any" aria-modal="true" {...attrs} className={tw(["", className])}>
      <div className="">{children}</div>
    </dialog>
  );
}
