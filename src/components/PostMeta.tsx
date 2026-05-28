import { formatDate, isDifferentDay } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PostMetaProps {
  date?: string;
  modified?: string;
  readingTime?: number;
  authorName?: string;
  className?: string;
}

export function PostMeta({ date, modified, readingTime, authorName, className }: PostMetaProps) {
  const published = formatDate(date);
  const updated = isDifferentDay(date, modified) ? formatDate(modified) : "";
  const items = [
    authorName,
    published ? <time dateTime={date}>{published}</time> : null,
    updated ? <span>Updated {updated}</span> : null,
    readingTime ? `${readingTime} min read` : null
  ].filter(Boolean);

  if (!items.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-muted", className)}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-3">
          {index > 0 ? <span aria-hidden="true" className="h-1 w-1 rounded-full bg-hairline" /> : null}
          {item}
        </span>
      ))}
    </div>
  );
}
