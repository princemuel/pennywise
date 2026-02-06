"use client";

import { Link, useLocation } from "@tanstack/react-router";

/**
 * A React component that provides navigation between routes.
 * Automatically marks the current route as active.
 */

type Props = React.ComponentProps<typeof Link> & {
  text?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  mini?: boolean;
};

const NavLink = ({ text, Icon, mini, ...props }: Props) => {
  const location = useLocation();
  const isActive =
    location.pathname === props.to || location.pathname?.startsWith(`${String(props.to)}/`);

  return (
    <Link
      {...props}
      aria-current={isActive ? "page" : false}
      className={`flex items-center gap-4 rounded px-4 py-2 transition-colors ${
        isActive ? "bg-grey-800 text-white" : "hover:bg-grey-800 text-grey-300"
      } ${props.className || ""}`}
    >
      {Icon && <Icon className="h-6 w-6 shrink-0" />}
      {!mini && text && <span className="text-sm font-medium">{text}</span>}
    </Link>
  );
};

export default NavLink;
