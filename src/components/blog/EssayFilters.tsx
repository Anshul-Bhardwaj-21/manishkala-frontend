import Link from "next/link";

import { LEGACY_ESSAY_GROUPS } from "@/lib/legacyEssayGroups";
import { cn } from "@/lib/utils";

interface EssayFiltersProps {
  activeGroup?: string;
}

const visibleFilterGroups = LEGACY_ESSAY_GROUPS.filter((group) => group.slug !== "movie-mania");

export function EssayFilters({ activeGroup }: EssayFiltersProps) {
  const filters = [{ label: "All", slug: "all", href: "/blog" }, ...visibleFilterGroups.map((group) => ({
    label: group.label,
    slug: group.slug,
    href: `/blog?group=${encodeURIComponent(group.slug)}`
  }))];

  return (
    <nav aria-label="Writing filters" className="flex flex-wrap gap-2 border-y border-hairline bg-linen/25 py-3">
      {filters.map((filter) => {
        const active = activeGroup ? filter.slug === activeGroup : filter.slug === "all";

        return (
          <Link
            key={filter.slug}
            href={filter.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 items-center border px-3 text-sm font-bold transition-colors",
              active ? "border-accent bg-paper text-accent" : "border-transparent text-muted hover:border-hairline hover:bg-paper hover:text-accent"
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </nav>
  );
}
