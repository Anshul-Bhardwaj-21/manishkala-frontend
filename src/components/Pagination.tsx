import Link from "next/link";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function blogHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

function pageWindow(currentPage: number, totalPages: number): number[] {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Blog pagination" className="mt-12 flex flex-col gap-4 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={blogHref(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : undefined}
        className={cn(
          "inline-flex min-h-11 items-center justify-center border border-hairline px-4 text-sm font-bold transition-colors hover:border-accent hover:text-accent",
          currentPage <= 1 && "pointer-events-none opacity-45"
        )}
      >
        Previous
      </Link>
      <ol className="flex flex-wrap justify-center gap-2">
        {pageWindow(currentPage, totalPages).map((page) => (
          <li key={page}>
            <Link
              href={blogHref(page)}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Go to page ${page}`}
              className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center border px-3 text-sm font-bold transition-colors",
                page === currentPage ? "border-ink bg-ink text-paper" : "border-hairline text-muted hover:border-accent hover:text-accent"
              )}
            >
              {page}
            </Link>
          </li>
        ))}
      </ol>
      <Link
        href={blogHref(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : undefined}
        className={cn(
          "inline-flex min-h-11 items-center justify-center border border-hairline px-4 text-sm font-bold transition-colors hover:border-accent hover:text-accent",
          currentPage >= totalPages && "pointer-events-none opacity-45"
        )}
      >
        Next
      </Link>
    </nav>
  );
}
