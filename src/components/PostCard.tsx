import Image from "next/image";
import Link from "next/link";

import { PostMeta } from "@/components/PostMeta";
import { TopicChip } from "@/components/TopicChip";
import { calculateReadingTime } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { FrontendArticle } from "@/types/content";

interface PostCardProps {
  article: FrontendArticle;
  className?: string;
  priority?: boolean;
}

export function PostCard({ article, className, priority = false }: PostCardProps) {
  const image = article.featuredImage;
  const category = article.categories[0];
  const readingTime = calculateReadingTime(article.contentHtml || article.excerptHtml || "");

  return (
    <article className={cn("group border-t border-hairline pt-5", className)}>
      {image ? (
        <Link href={article.href} aria-label={article.title} className="block overflow-hidden bg-linen">
          <div className="relative aspect-[16/10]">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
            />
          </div>
        </Link>
      ) : null}
      <div className={image ? "mt-5" : ""}>
        {category ? <TopicChip label={category.name} /> : null}
        <h3 className="mt-4 font-serif text-2xl font-semibold leading-tight text-ink">
          <Link href={article.href} className="transition-colors hover:text-accent">
            {article.title}
          </Link>
        </h3>
        {article.excerptText ? <p className="mt-3 text-base leading-7 text-muted">{article.excerptText}</p> : null}
        <PostMeta className="mt-5" date={article.date} modified={article.modified} readingTime={readingTime} authorName={article.author?.name} />
      </div>
    </article>
  );
}
