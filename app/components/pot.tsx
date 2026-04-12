


export const Pot = ({name = "token"}) => {
  return (<input
  type="text"
  name={name}
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  className="absolute top-auto -left-2500 h-px w-px overflow-hidden"
/>)
}
