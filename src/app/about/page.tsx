import Image from "next/image";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ArticleBody } from "@/components/blog/ArticleBody";
import { Container } from "@/components/Container";
import { InlineNotice } from "@/components/ApiNotice";
import { TopicChip } from "@/components/TopicChip";
import { getAcfImage } from "@/lib/acf";
import { stripHtml } from "@/lib/content";
import { getProfileAboutHtml, getProfileAchievementsHtml, getProfileContactLinks } from "@/lib/profile";
import { absoluteUrl, metadataFromYoast } from "@/lib/seo";
import { getAboutPage, getResolvedLegacyEssayGroups, getSiteInfo } from "@/lib/wordpress";
import type { WPPage } from "@/types/wordpress";

export const revalidate = 300;

function getAboutPortrait(page: WPPage | null, title: string | undefined) {
  const acfImage = getAcfImage(page?.acf, ["portrait", "photo", "profile_photo", "about_photo", "image"]);

  if (acfImage?.url) {
    return {
      url: acfImage.url,
      alt: acfImage.alt || acfImage.title || title || "",
      width: acfImage.width,
      height: acfImage.height
    };
  }

  const media = page?._embedded?.["wp:featuredmedia"]?.[0];

  if (!media?.source_url) {
    return undefined;
  }

  return {
    url: media.source_url,
    alt: media.alt_text || stripHtml(media.title?.rendered ?? "") || title || "",
    width: media.media_details?.width,
    height: media.media_details?.height
  };
}

function AboutSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-hairline pt-8 md:grid-cols-[140px_minmax(0,1fr)]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{number}</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [identity, page] = await Promise.all([getSiteInfo().catch(() => null), getAboutPage().catch(() => null)]);

  return metadataFromYoast(
    page?.yoast_head_json,
    {
      title: page?.title.rendered ? stripHtml(page.title.rendered) : identity?.name,
      description: stripHtml(page?.excerpt?.rendered ?? page?.content?.rendered ?? "") || identity?.description,
      path: "/about"
    },
    identity
  );
}

export default async function AboutPage() {
  const draft = await draftMode();
  const [pageResult, categoriesResult, identityResult] = await Promise.allSettled([
    getAboutPage({ preview: draft.isEnabled }),
    getResolvedLegacyEssayGroups(),
    getSiteInfo()
  ]);
  const page = pageResult.status === "fulfilled" ? pageResult.value : null;
  const groups = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const identity = identityResult.status === "fulfilled" ? identityResult.value : null;
  const title = page?.title.rendered ? stripHtml(page.title.rendered) : identity?.name;
  const portrait = getAboutPortrait(page, title);
  const contactLinks = getProfileContactLinks(page?.acf);
  const aboutHtml = getProfileAboutHtml(page?.acf) ?? page?.content.rendered;
  const achievementsHtml = getProfileAchievementsHtml(page?.acf);
  const sameAs = contactLinks.filter((link) => link.href.startsWith("http")).map((link) => link.href);
  const phone = contactLinks.find((link) => link.href.startsWith("tel:"))?.value;
  const email = contactLinks.find((link) => link.href.startsWith("mailto:"))?.value;
  const jsonLd = identity?.name
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: identity.name,
        description: identity.description,
        url: absoluteUrl("/about"),
        image: portrait?.url ?? identity.logo?.url,
        sameAs: sameAs.length ? sameAs : undefined,
        telephone: phone,
        email
      }
    : null;

  return (
    <section className="py-16 md:py-20">
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /> : null}
      <Container>
        <div className="grid gap-12 border-b border-hairline pb-12 lg:grid-cols-[0.82fr_1fr] lg:items-start">
          <div>
            {title ? <h1 className="text-balance font-serif text-5xl font-semibold leading-[1.04] text-ink md:text-6xl">{title}</h1> : null}
            {identity?.description ? <p className="mt-6 max-w-xl text-xl leading-9 text-muted">{identity.description}</p> : null}
            {groups.length ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {groups.map((group) => (
                  <a key={group.slug} href={`/blog?group=${encodeURIComponent(group.slug)}`}>
                    <TopicChip label={group.label} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          {portrait ? (
            <div className="border border-hairline bg-linen p-4 shadow-editorial">
              <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                <Image
                  src={portrait.url}
                  alt={portrait.alt || title || ""}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>

      <Container className="mt-14">
        <div className="mx-auto grid max-w-4xl gap-10">
          <AboutSection number="01" title="About Me">
            {aboutHtml ? <ArticleBody html={aboutHtml} /> : <InlineNotice>No about page content is available from WordPress.</InlineNotice>}
          </AboutSection>

          <AboutSection number="02" title="Connect">
            {contactLinks.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {contactLinks.map((link) => {
                  const external = link.href.startsWith("http");

                  return (
                    <li key={`${link.label}:${link.href}`}>
                      <a
                        href={link.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="block border border-hairline bg-linen/25 p-4 transition-colors hover:border-accent hover:bg-linen/55"
                      >
                        <span className="block text-xs font-bold uppercase tracking-[0.14em] text-muted">{link.label}</span>
                        <span className="mt-2 block break-words font-semibold text-ink">{link.value}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <InlineNotice>Contact details are not published from WordPress yet.</InlineNotice>
            )}
          </AboutSection>

          <AboutSection number="03" title="DRDO Achievements">
            {achievementsHtml ? (
              <ArticleBody html={achievementsHtml} className="text-base" />
            ) : (
              <InlineNotice>DRDO achievements content is not published from WordPress yet.</InlineNotice>
            )}
          </AboutSection>
        </div>
      </Container>
    </section>
  );
}
