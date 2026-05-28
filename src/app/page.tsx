import { draftMode } from "next/headers";
import type { Metadata } from "next";

import { ApiNotice, InlineNotice } from "@/components/ApiNotice";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { FeaturedEssay } from "@/components/FeaturedEssay";
import { PostCard } from "@/components/PostCard";
import { TopicChip } from "@/components/TopicChip";
import { ArticleBody } from "@/components/ArticleBody";
import { stripHtml, truncateText } from "@/lib/content";
import { metadataFromYoast } from "@/lib/seo";
import { getAboutPage, getCategories, getFeaturedPost, getHomePage, getPosts, getSiteIdentity } from "@/lib/wordpress";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [identity, page] = await Promise.all([getSiteIdentity().catch(() => null), getHomePage().catch(() => null)]);

  return metadataFromYoast(
    page?.yoast_head_json,
    {
      title: identity?.name ?? stripHtml(page?.title.rendered ?? ""),
      description: stripHtml(page?.excerpt?.rendered ?? page?.content?.rendered ?? "") || identity?.description,
      path: "/"
    },
    identity
  );
}

export default async function HomePage() {
  const draft = await draftMode();
  const preview = draft.isEnabled;
  const [homeResult, aboutResult, archiveResult, featuredResult, categoriesResult, identityResult] = await Promise.allSettled([
    getHomePage({ preview }),
    getAboutPage({ preview }),
    getPosts({ page: 1, perPage: 7, preview }),
    getFeaturedPost(),
    getCategories(),
    getSiteIdentity()
  ]);

  const home = homeResult.status === "fulfilled" ? homeResult.value : null;
  const about = aboutResult.status === "fulfilled" ? aboutResult.value : null;
  const archive = archiveResult.status === "fulfilled" ? archiveResult.value : null;
  const featured = featuredResult.status === "fulfilled" ? featuredResult.value ?? archive?.articles[0] ?? null : archive?.articles[0] ?? null;
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const identity = identityResult.status === "fulfilled" ? identityResult.value : null;
  const recentArticles = (archive?.articles ?? []).filter((article) => article.id !== featured?.id || article.sourceType !== featured?.sourceType).slice(0, 6);
  const homeTitle = home?.title.rendered ? stripHtml(home.title.rendered) : identity?.name;
  const aboutTitle = about?.title.rendered ? stripHtml(about.title.rendered) : undefined;
  const aboutTeaser = about?.content.rendered ? truncateText(stripHtml(about.content.rendered), 320) : undefined;

  return (
    <>
      <section className="py-16 md:py-24">
        <Container>
          {home ? (
            <div className="max-w-3xl">
              {homeTitle ? <h1 className="font-serif text-5xl font-semibold leading-[1.04] text-ink md:text-7xl">{homeTitle}</h1> : null}
              {home.content.rendered ? <ArticleBody html={home.content.rendered} className="mt-8" /> : null}
            </div>
          ) : (
            <InlineNotice>No homepage content is available from WordPress.</InlineNotice>
          )}
        </Container>
      </section>

      {homeResult.status === "rejected" || archiveResult.status === "rejected" ? <ApiNotice className="mb-16" /> : null}

      {featured ? (
        <section className="py-8">
          <Container>
            <FeaturedEssay article={featured} />
          </Container>
        </section>
      ) : null}

      {categories.length ? (
        <section className="py-10">
          <Container>
            <div className="flex flex-wrap gap-3 border-t border-hairline pt-8">
              {categories.map((category) => (
                <a key={category.id} href={`/blog?category=${encodeURIComponent(category.slug)}`}>
                  <TopicChip label={category.name} />
                </a>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {recentArticles.length ? (
        <section className="py-12">
          <Container>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article) => (
                <PostCard key={`${article.sourceType}:${article.id}`} article={article} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {about && aboutTitle && aboutTeaser ? (
        <section className="py-14">
          <Container>
            <div className="grid gap-8 border-y border-hairline py-9 lg:grid-cols-[0.65fr_1fr] lg:items-center">
              <h2 className="font-serif text-4xl font-semibold leading-tight text-ink">{aboutTitle}</h2>
              <div>
                <p className="text-lg leading-8 text-muted">{aboutTeaser}</p>
                <Button href="/about" variant="secondary" className="mt-7">
                  {aboutTitle}
                </Button>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
