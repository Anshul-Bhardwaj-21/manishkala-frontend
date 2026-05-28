import { draftMode } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";

import { InlineNotice } from "@/components/ApiNotice";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { FeaturedEssay } from "@/components/FeaturedEssay";
import { AchievementHighlights } from "@/components/home/AchievementHighlights";
import { RecentEssays } from "@/components/home/RecentEssays";
import { HomeHero } from "@/components/home/Hero";
import { stripHtml, truncateText } from "@/lib/content";
import { metadataFromYoast } from "@/lib/seo";
import {
  getAboutPage,
  getAchievementHighlights,
  getFeaturedEssay,
  getHomePage,
  getLatestEssays,
  getResolvedLegacyEssayGroups,
  getSiteInfo
} from "@/lib/wordpress";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [site, page] = await Promise.all([getSiteInfo().catch(() => null), getHomePage().catch(() => null)]);

  return metadataFromYoast(
    page?.yoast_head_json,
    {
      title: site?.name,
      description: site?.description || stripHtml(page?.content?.rendered ?? ""),
      path: "/"
    },
    site
  );
}

export default async function HomePage() {
  const draft = await draftMode();
  const preview = draft.isEnabled;
  const [siteResult, aboutResult, featuredResult, recentResult, groupsResult, achievementResult] = await Promise.allSettled([
    getSiteInfo(),
    getAboutPage({ preview }),
    getFeaturedEssay({ preview }),
    getLatestEssays(7, { preview }),
    getResolvedLegacyEssayGroups({ preview }),
    getAchievementHighlights(3, { preview })
  ]);

  const site = siteResult.status === "fulfilled" ? siteResult.value : null;
  const about = aboutResult.status === "fulfilled" ? aboutResult.value : null;
  const featured = featuredResult.status === "fulfilled" ? featuredResult.value : null;
  const recent = recentResult.status === "fulfilled" ? recentResult.value : [];
  const groups = groupsResult.status === "fulfilled" ? groupsResult.value : [];
  const achievements = achievementResult.status === "fulfilled" ? achievementResult.value : [];
  const aboutText = about?.content?.rendered ? truncateText(stripHtml(about.content.rendered), 320) : undefined;
  const subtitle = site?.description || aboutText;
  const recentWithoutFeatured = recent.filter((essay) => essay.slug !== featured?.slug).slice(0, 6);

  return (
    <>
      <HomeHero title={site?.name} subtitle={subtitle} />

      {featured ? (
        <section className="py-8">
          <Container>
            <FeaturedEssay article={featured} />
          </Container>
        </section>
      ) : null}

      {groups.length ? (
        <section className="py-12">
          <Container>
            <div className="border-y border-hairline py-8">
              <h2 className="font-serif text-3xl font-semibold text-ink">Topics</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {groups.map((group) => (
                  <Link
                    key={group.slug}
                    href={`/blog?group=${encodeURIComponent(group.slug)}`}
                    className="inline-flex min-h-10 items-center border border-hairline px-3 text-sm font-bold text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    {group.label}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {recentWithoutFeatured.length ? (
        <RecentEssays essays={recentWithoutFeatured} />
      ) : (
        <Container className="py-12">
          <InlineNotice>No writings are available from WordPress yet.</InlineNotice>
        </Container>
      )}

      <AchievementHighlights items={achievements} />

      {about && aboutText ? (
        <section className="py-14">
          <Container>
            <div className="grid gap-8 border-y border-hairline py-9 lg:grid-cols-[0.65fr_1fr] lg:items-center">
              <h2 className="font-serif text-4xl font-semibold leading-tight text-ink">{stripHtml(about.title.rendered)}</h2>
              <div>
                <p className="text-lg leading-8 text-muted">{aboutText}</p>
                <Button href="/about" variant="secondary" className="mt-7">
                  About
                </Button>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
