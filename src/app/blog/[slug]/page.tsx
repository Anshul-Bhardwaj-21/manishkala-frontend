import Image from "next/image";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/blog/ArticleBody";
import { ArticleTOC } from "@/components/ArticleTOC";
import { AuthorCard } from "@/components/AuthorCard";
import { Badge } from "@/components/Badge";
import { Container } from "@/components/Container";
import { InlineNotice } from "@/components/ApiNotice";
import { PostMeta } from "@/components/PostMeta";
import { RelatedPosts } from "@/components/RelatedPosts";
import { getAcfReferenceBlock, getAcfString } from "@/lib/acf";
import { calculateReadingTime, extractHeadings } from "@/lib/content";
import { absoluteUrl, metadataFromYoast } from "@/lib/seo";
import { getAllArticleSlugs, getEssayBySlug, getRelatedEssays, getSiteInfo } from "@/lib/wordpress";
import type { WPACFReference } from "@/types/wordpress";

export const revalidate = 300;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs().catch(() => []);
  return slugs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [identity, article] = await Promise.all([
    getSiteInfo().catch(() => null),
    getEssayBySlug(decodeURIComponent(slug)).catch(() => null)
  ]);

  if (!article) {
    return metadataFromYoast(undefined, {
      path: `/blog/${slug}`
    }, identity);
  }

  return metadataFromYoast(
    article.yoast,
    {
      title: article.title,
      description: article.excerptText,
      path: article.href,
      image: article.featuredImage?.url,
      openGraphType: "article",
      publishedTime: article.date,
      modifiedTime: article.modified,
      authors: article.author?.name ? [article.author.name] : identity?.name ? [identity.name] : undefined
    },
    identity
  );
}

function ReferencesBlock({ label, references }: { label: string; references: WPACFReference[] | string }) {
  if (typeof references === "string") {
    return (
      <section className="mt-12 border-t border-hairline pt-8">
        <h2 className="font-serif text-3xl font-semibold text-ink">{label}</h2>
        <ArticleBody html={references} className="mt-5 text-base" />
      </section>
    );
  }

  if (!references.length) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-hairline pt-8">
      <h2 className="font-serif text-3xl font-semibold text-ink">{label}</h2>
      <ol className="mt-5 space-y-4 text-base leading-7 text-muted">
        {references.map((reference, index) => (
          <li key={`${reference.title ?? reference.url ?? index}-${index}`}>
            {reference.url ? (
              <a href={reference.url} className="font-semibold text-accent underline" target="_blank" rel="noreferrer">
                {reference.title || reference.source || reference.url}
              </a>
            ) : (
              <span className="font-semibold text-ink">{reference.title || reference.source}</span>
            )}
            {reference.note ? <span> {reference.note}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const draft = await draftMode();
  const { slug } = await params;
  const [article, identity] = await Promise.all([
    getEssayBySlug(decodeURIComponent(slug), { preview: draft.isEnabled }).catch(() => null),
    getSiteInfo().catch(() => null)
  ]);

  if (!article) {
    notFound();
  }

  const headings = extractHeadings(article.contentHtml);
  const subtitle = getAcfString(article.acf, ["subtitle", "deck", "dek", "summary"]);
  const readingTime = calculateReadingTime(article.contentHtml);
  const referenceBlock = getAcfReferenceBlock(article.acf);
  const relatedArticles = await getRelatedEssays(article).catch(() => []);
  const canonical = absoluteUrl(article.href);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerptText,
    image: article.featuredImage?.url ? [article.featuredImage.url] : undefined,
    datePublished: article.date,
    dateModified: article.modified ?? article.date,
    author: article.author?.name
      ? {
          "@type": "Person",
          name: article.author.name
        }
      : identity?.name
        ? {
            "@type": "Person",
            name: identity.name
          }
        : undefined,
    publisher: identity?.name
      ? {
          "@type": "Person",
          name: identity.name
        }
      : undefined,
    mainEntityOfPage: canonical
  };

  return (
    <article className="py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }} />
      <Container size="narrow">
        {article.group ? <Badge>{article.group.label}</Badge> : null}
        <h1 className="mt-5 text-balance font-serif text-5xl font-semibold leading-[1.04] text-ink md:text-6xl">{article.title}</h1>
        {subtitle ? <p className="mt-6 text-xl leading-9 text-muted">{subtitle}</p> : null}
        <div className="mt-7 border-y border-hairline bg-linen/25 py-4">
          <PostMeta date={article.date} modified={article.modified} readingTime={readingTime} authorName={article.author?.name} />
        </div>
      </Container>

      {article.featuredImage ? (
        <Container className="mt-10" size="wide">
          <div className="border border-hairline bg-linen p-2">
            <div className="relative aspect-[16/9] overflow-hidden bg-paper">
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.alt}
                fill
                sizes="(min-width: 1280px) 1120px, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      ) : null}

      <Container className="mt-12">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,720px)] lg:justify-center">
          <ArticleTOC headings={headings} />
          <div>
            {article.contentHtml ? (
              <ArticleBody html={article.contentHtml} />
            ) : (
              <InlineNotice>No article body was returned by WordPress.</InlineNotice>
            )}
            {referenceBlock ? <ReferencesBlock label={referenceBlock.label} references={referenceBlock.value} /> : null}
            {article.author ? (
              <div className="mt-12">
                <AuthorCard author={article.author} />
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      <Container>
        <RelatedPosts articles={relatedArticles} />
      </Container>
    </article>
  );
}
