import type { ArticleHeading } from "@/lib/content";
import { cn } from "@/lib/utils";

export function ArticleTOC({ headings }: { headings: ArticleHeading[] }) {
  if (headings.length < 2) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto border-l border-hairline bg-linen/25 p-5 lg:block">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Contents</p>
      <ol className="mt-4 space-y-3 text-sm font-semibold leading-5 text-muted">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn("transition-colors hover:text-accent", heading.level === 3 && "block pl-4 text-xs")}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
