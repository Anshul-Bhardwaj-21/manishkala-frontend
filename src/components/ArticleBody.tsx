import { addHeadingIds } from "@/lib/content";
import { cn } from "@/lib/utils";

interface ArticleBodyProps {
  html: string;
  className?: string;
}

export function ArticleBody({ html, className }: ArticleBodyProps) {
  return <div className={cn("prose-editorial", className)} dangerouslySetInnerHTML={{ __html: addHeadingIds(html) }} />;
}
