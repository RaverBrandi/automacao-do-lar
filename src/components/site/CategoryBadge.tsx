import { Link } from "@tanstack/react-router";

export function CategoryBadge({
  name,
  slug,
  size = "sm",
  asLink = true,
}: {
  name: string;
  slug?: string;
  size?: "sm" | "md";
  asLink?: boolean;
}) {
  const cls =
    "inline-flex items-center rounded-full font-semibold bg-[var(--color-badge)] text-[var(--color-badge-foreground)] " +
    (size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-1 text-[0.6875rem]") +
    " tracking-wide uppercase";
  if (asLink && slug) {
    return (
      <Link to="/categoria/$slug" params={{ slug }} className={cls + " hover:opacity-80 transition"}>
        {name}
      </Link>
    );
  }
  return <span className={cls}>{name}</span>;
}
