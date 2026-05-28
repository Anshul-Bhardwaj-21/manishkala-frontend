import Image from "next/image";
import Link from "next/link";

import { PostMeta } from "@/components/PostMeta";
import { calculateReadingTime } from "@/lib/content";
import type { FrontendArticle } from "@/types/content";

export function FeaturedEssay({ article }: { article: FrontendArticle }) {
  const image = article.featuredImage;
  const readingTime = calculateReadingTime(article.contentHtml || article.excerptHtml || "");

  return (
    <article className="grid gap-8 border-y border-hairline bg-linen/25 py-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
      {image ? (
        <Link href={article.href} aria-label={article.title} className="block overflow-hidden bg-linen">
          <div className="relative aspect-[4/3] h-full min-h-[320px]">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.025]"
              priority
            />
          </div>
        </Link>
      ) : null}
      <div className="flex flex-col justify-center px-0 py-2 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-9 bg-accent" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{article.group?.label ?? "Featured Writing"}</p>
        </div>
        <h2 className="mt-5 max-w-3xl text-balance font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">
          <Link href={article.href} className="transition-colors hover:text-accent">
            {article.title}
          </Link>
        </h2>
        {article.excerptText ? <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{article.excerptText}</p> : null}
        <PostMeta className="mt-6" date={article.date} modified={article.modified} readingTime={readingTime} authorName={article.author?.name} />
        <Link href={article.href} className="mt-7 inline-flex w-fit border-b border-accent pb-1 text-sm font-bold text-accent transition-colors hover:text-ink">
          Read writing
        </Link>
      </div>
    </article>
  );
}
