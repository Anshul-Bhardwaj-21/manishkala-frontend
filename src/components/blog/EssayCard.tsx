import Image from "next/image";
import Link from "next/link";

import { PostMeta } from "@/components/PostMeta";
import { calculateReadingTime } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { FrontendArticle } from "@/types/content";

interface EssayCardProps {
  essay: FrontendArticle;
  className?: string;
  priority?: boolean;
}

export function EssayCard({ essay, className, priority = false }: EssayCardProps) {
  const readingTime = calculateReadingTime(essay.contentHtml || essay.excerptHtml || "");

  return (
    <article
      className={cn(
        "group flex h-full flex-col border-t border-hairline bg-transparent pt-6 transition-colors hover:border-accent",
        className
      )}
    >
      {essay.featuredImage ? (
        <Link href={essay.href} className="block overflow-hidden bg-linen" aria-label={essay.title}>
          <div className="relative aspect-[16/10]">
            <Image
              src={essay.featuredImage.url}
              alt={essay.featuredImage.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
            />
          </div>
        </Link>
      ) : null}
      <div className={cn("flex flex-1 flex-col", essay.featuredImage ? "mt-5" : "")}>
        {essay.group ? (
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-accent/75" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{essay.group.label}</p>
          </div>
        ) : null}
        <h2 className="mt-3 text-balance font-serif text-2xl font-semibold leading-tight text-ink">
          <Link href={essay.href} className="transition-colors hover:text-accent">
            {essay.title}
          </Link>
        </h2>
        {essay.excerptText ? <p className="mt-3 text-base leading-7 text-muted">{essay.excerptText}</p> : null}
        <div className="mt-auto pt-5">
          <PostMeta date={essay.date} modified={essay.modified} readingTime={readingTime} authorName={essay.author?.name} />
        </div>
      </div>
    </article>
  );
}
