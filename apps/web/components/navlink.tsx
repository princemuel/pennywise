"use client";

import type { Route } from "next";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";

/**
 * A React component that extends the HTML `<a>` element to provide [prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching)
 * and client-side navigation between routes.
 *
 * It is the primary way to navigate between routes in Next.js.
 *
 * Read more: [Next.js docs: `<Link>`](https://nextjs.org/docs/app/api-reference/components/link)
 */

type Props<T> = Prettify<
  LinkProps<T> & {
    children?: React.ReactNode;
    className?: string;
  } & React.RefAttributes<HTMLAnchorElement>
>;

const NavLink = <T extends Route>(props: Props<T>) => {
  const pathname = usePathname();
  const isActive = pathname === props.href || pathname?.startsWith(`${props.href}/`);

  return <Link {...props} aria-current={isActive ? "page" : false} />;
};

export default NavLink;
