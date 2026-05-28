import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiNotice, InlineNotice } from "@/components/ApiNotice";
import { Container } from "@/components/Container";
import { FeaturedEssay } from "@/components/FeaturedEssay";
import { Pagination } from "@/components/Pagination";
import { PostCard } from "@/components/PostCard";
import { TopicChip } from "@/components/TopicChip";
import { ArticleBody } from "@/components/ArticleBody";
import { stripHtml } from "@/lib/content";
import { metadataFromYoast } from "@/lib/seo";
import { getCategories, getPageBySlug, getPosts, getSiteIdentity } from "@/lib/wordpress";

export const revalidate = 300;

interface BlogPageProps {
  searchParams?: Promise<{
    page?: string;
    category?: string;
  }>;
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const categorySlug = resolvedSearchParams.category;
  const [identity, page, categories] = await Promise.all([
    getSiteIdentity().catch(() => null),
    getPageBySlug("blog").catch(() => null),
    getCategories().catch(() => [])
  ]);
  const selectedCategory = categorySlug ? categories.find((category) => category.slug === categorySlug) : undefined;

  return metadataFromYoast(
    page?.yoast_head_json,
    {
      title: selectedCategory?.name ?? (page?.title.rendered ? stripHtml(page.title.rendered) : identity?.name),
      description: stripHtml(page?.excerpt?.rendered ?? page?.content?.rendered ?? "") || identity?.description,
      path: categorySlug ? `/blog?category=${encodeURIComponent(categorySlug)}` : "/blog"
    },
    identity
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentPage = parsePage(resolvedSearchParams.page);
  const categorySlug = resolvedSearchParams.category;
  const [categoriesResult, pageResult, identityResult] = await Promise.allSettled([
    getCategories(),
    getPageBySlug("blog"),
    getSiteIdentity()
  ]);
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const selectedCategory = categorySlug ? categories.find((category) => category.slug === categorySlug) : undefined;
  const page = pageResult.status === "fulfilled" ? pageResult.value : null;
  const identity = identityResult.status === "fulfilled" ? identityResult.value : null;

  if (categorySlug && !selectedCategory) {
    notFound();
  }

  const archive = await getPosts({ page: currentPage, categoryId: selectedCategory?.id }).catch(() => null);

  if (archive && currentPage > archive.totalPages && archive.totalPages > 0) {
    notFound();
  }

  const [featured, ...rest] = archive?.articles ?? [];
  const heading = selectedCategory?.name ?? (page?.title.rendered ? stripHtml(page.title.rendered) : identity?.name);

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="border-t border-hairline pt-8">
          {heading ? <h1 className="font-serif text-5xl font-semibold leading-[1.04] text-ink md:text-6xl">{heading}</h1> : null}
          {page?.content.rendered ? <ArticleBody html={page.content.rendered} className="mt-7" /> : identity?.description ? <p className="mt-6 max-w-2xl text-xl leading-9 text-muted">{identity.description}</p> : null}
          {categories.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {categories.map((category) => (
                <a key={category.id} href={`/blog?category=${encodeURIComponent(category.slug)}`}>
                  <TopicChip label={category.name} className={selectedCategory?.id === category.id ? "border-accent text-accent" : undefined} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </Container>

      {!archive ? (
        <ApiNotice className="mt-10" />
      ) : (
        <Container className="mt-12">
          {archive.articles.length ? (
            <>
              {featured ? <FeaturedEssay article={featured} /> : null}
              {rest.length ? (
                <div className="mt-12 grid gap-9 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article, index) => (
                    <PostCard key={`${article.sourceType}:${article.id}`} article={article} priority={index < 2} />
                  ))}
                </div>
              ) : null}
              <Pagination currentPage={archive.currentPage} totalPages={archive.totalPages} />
            </>
          ) : (
            <InlineNotice>No published posts were returned by WordPress.</InlineNotice>
          )}
        </Container>
      )}
    </section>
  );
}
