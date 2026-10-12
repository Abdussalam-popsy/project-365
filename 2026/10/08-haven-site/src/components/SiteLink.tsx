import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/**
 * Site-relative links ("/agents/leasing", "/#platform") go through Next's <Link>, which adds the
 * base path the GitHub Pages preview needs. mailto:, https:// and "#" links stay plain <a> tags.
 */
export function SiteLink({ href, ...props }: SiteLinkProps) {
  return href.startsWith("/") ? <Link href={href} {...props} /> : <a href={href} {...props} />;
}
