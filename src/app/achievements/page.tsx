import { draftMode } from "next/headers";
import type { Metadata } from "next";

import { InlineNotice } from "@/components/ApiNotice";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { EssayGrid } from "@/components/blog/EssayGrid";
import { Container } from "@/components/Container";
import { stripHtml } from "@/lib/content";
import { metadataFromYoast } from "@/lib/seo";
import { getAchievementHighlights, getAchievementsPage, getSiteInfo } from "@/lib/wordpress";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [site, page] = await Promise.all([getSiteInfo().catch(() => null), getAchievementsPage().catch(() => null)]);

  return metadataFromYoast(
    page?.yoast_head_json,
    {
      title: page?.title.rendered ? stripHtml(page.title.rendered) : "Achievements",
      description: stripHtml(page?.excerpt?.rendered ?? page?.content?.rendered ?? "") || site?.description,
      path: "/achievements"
    },
    site
  );
}

export default async function AchievementsPage() {
  const draft = await draftMode();
  const [pageResult, achievementsResult] = await Promise.allSettled([
    getAchievementsPage({ preview: draft.isEnabled }),
    getAchievementHighlights(24, { preview: draft.isEnabled })
  ]);
  const page = pageResult.status === "fulfilled" ? pageResult.value : null;
  const achievements = achievementsResult.status === "fulfilled" ? achievementsResult.value : [];
  const title = page?.title.rendered ? stripHtml(page.title.rendered) : "Achievements";

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="border-t border-hairline pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">DRDO</p>
          <h1 className="mt-4 text-balance font-serif text-5xl font-semibold leading-[1.04] text-ink md:text-6xl">{title}</h1>
        </div>
      </Container>

      {page?.content.rendered ? (
        <Container className="mt-12" size="narrow">
          <ArticleBody html={page.content.rendered} />
        </Container>
      ) : null}

      <Container className="mt-14">
        {achievements.length ? (
          <EssayGrid essays={achievements} />
        ) : (
          <InlineNotice>Achievement entries are not published from WordPress yet.</InlineNotice>
        )}
      </Container>
    </section>
  );
}
