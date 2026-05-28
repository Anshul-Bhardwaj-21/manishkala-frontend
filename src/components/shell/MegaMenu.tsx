import Link from "next/link";

import type { FrontendArticle } from "@/types/content";

export interface ResolvedEssayGroup {
  label: string;
  slug: string;
  essays: Pick<FrontendArticle, "slug" | "title" | "href">[];
}

export function MegaMenu({ groups }: { groups: ResolvedEssayGroup[] }) {
  if (!groups.length) {
    return null;
  }

  return (
    <div className="invisible absolute right-0 top-full z-50 w-[min(820px,calc(100vw-2rem))] translate-y-3 border border-hairline bg-paper p-3 opacity-0 shadow-editorial transition-all duration-150 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100">
      <div className="border border-hairline/70 bg-linen/35 p-5">
        <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
        {groups.map((group) => (
          <section key={group.slug} className="border-t border-hairline pt-4 first:border-t-0 first:pt-0 md:[&:nth-child(-n+2)]:border-t-0 md:[&:nth-child(-n+2)]:pt-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-lg font-semibold text-ink">{group.label}</h2>
              <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
            </div>
            <ul className="mt-3 space-y-1.5">
              {group.essays.map((essay) => (
                <li key={essay.slug}>
                  <Link href={essay.href} className="block py-1 text-sm font-semibold leading-6 text-muted transition-colors hover:translate-x-0.5 hover:text-accent">
                    {essay.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        </div>
      </div>
    </div>
  );
}
