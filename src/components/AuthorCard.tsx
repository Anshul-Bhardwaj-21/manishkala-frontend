import { stripHtml } from "@/lib/content";
import type { FrontendAuthor } from "@/types/content";

interface AuthorCardProps {
  author?: FrontendAuthor;
  fallbackName?: string;
}

export function AuthorCard({ author, fallbackName }: AuthorCardProps) {
  const name = author?.name || fallbackName;
  const description = author?.description ? stripHtml(author.description) : undefined;

  if (!name && !description) {
    return null;
  }

  return (
    <aside className="mt-16 border-t border-hairline pt-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Written By</p>
      {name ? <p className="mt-3 font-signature text-6xl leading-none text-accent">{name}</p> : null}
      {description ? <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p> : null}
    </aside>
  );
}
