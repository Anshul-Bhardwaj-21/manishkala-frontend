import { initialsFromName, stripHtml } from "@/lib/content";
import type { FrontendAuthor } from "@/types/content";

interface AuthorCardProps {
  author?: FrontendAuthor;
}

export function AuthorCard({ author }: AuthorCardProps) {
  const name = author?.name;
  const description = author?.description ? stripHtml(author.description) : undefined;

  if (!name && !description) {
    return null;
  }

  return (
    <aside className="border-y border-hairline py-7">
      <div className="flex items-center gap-4">
        {author?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatarUrl} alt={name ?? ""} width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
        ) : name ? (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-hairline bg-linen font-serif text-xl font-semibold text-accent">
            {initialsFromName(name)}
          </div>
        ) : null}
        <div>
          {name ? <h2 className="font-serif text-2xl font-semibold text-ink">{name}</h2> : null}
          {description ? <p className="mt-2 max-w-2xl text-base leading-7 text-muted">{description}</p> : null}
        </div>
      </div>
    </aside>
  );
}
