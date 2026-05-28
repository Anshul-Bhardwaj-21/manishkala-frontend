import Image from "next/image";
import Link from "next/link";

import { PostMeta } from "@/components/PostMeta";
import { TopicChip } from "@/components/TopicChip";
import { calculateReadingTime } from "@/lib/content";
import type { FrontendArticle } from "@/types/content";

export function FeaturedEssay({ article }: { article: FrontendArticle }) {
  const image = article.featuredImage;
  const category = article.categories[0];
  const readingTime = calculateReadingTime(article.contentHtml || article.excerptHtml || "");

  return (
    <article className="grid gap-8 border-y border-hairline py-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
      {image ? (
        <Link href={article.href} aria-label={article.title} className="block overflow-hidden bg-linen">
          <div className="relative aspect-[4/3]">
            <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover" priority />
          </div>
        </Link>
      ) : null}
      <div>
        {category ? <TopicChip label={category.name} /> : null}
        <h2 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">
          <Link href={article.href} className="transition-colors hover:text-accent">
            {article.title}
          </Link>
        </h2>
        {article.excerptText ? <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{article.excerptText}</p> : null}
        <PostMeta className="mt-6" date={article.date} modified={article.modified} readingTime={readingTime} authorName={article.author?.name} />
      </div>
    </article>
  );
}
