import Image from "next/image";
import { draftMode } from "next/headers";
import type { Metadata } from "next";

import { ArticleBody } from "@/components/ArticleBody";
import { Container } from "@/components/Container";
import { InlineNotice } from "@/components/ApiNotice";
import { TopicChip } from "@/components/TopicChip";
import { getAcfImage } from "@/lib/acf";
import { stripHtml } from "@/lib/content";
import { absoluteUrl, metadataFromYoast } from "@/lib/seo";
import { getAboutPage, getCategories, getSiteIdentity } from "@/lib/wordpress";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [identity, page] = await Promise.all([getSiteIdentity().catch(() => null), getAboutPage().catch(() => null)]);

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
    getCategories(),
    getSiteIdentity()
  ]);
  const page = pageResult.status === "fulfilled" ? pageResult.value : null;
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const identity = identityResult.status === "fulfilled" ? identityResult.value : null;
  const title = page?.title.rendered ? stripHtml(page.title.rendered) : identity?.name;
  const portrait = getAcfImage(page?.acf, ["portrait", "photo", "image"]);
  const jsonLd = identity?.name
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: identity.name,
        description: identity.description,
        url: absoluteUrl("/about"),
        image: portrait?.url ?? identity.logo?.url
      }
    : null;

  return (
    <section className="py-16 md:py-20">
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /> : null}
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1fr] lg:items-start">
          <div>
            {title ? <h1 className="font-serif text-5xl font-semibold leading-[1.04] text-ink md:text-6xl">{title}</h1> : null}
            {identity?.description ? <p className="mt-6 max-w-xl text-xl leading-9 text-muted">{identity.description}</p> : null}
            {categories.length ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <a key={category.id} href={`/blog?category=${encodeURIComponent(category.slug)}`}>
                    <TopicChip label={category.name} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          {portrait ? (
            <div className="border border-hairline bg-linen p-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                <Image
                  src={portrait.url}
                  alt={portrait.alt || portrait.title || title || ""}
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
        <div className="mx-auto max-w-3xl">
          {page?.content.rendered ? <ArticleBody html={page.content.rendered} /> : <InlineNotice>No about page content is available from WordPress.</InlineNotice>}
        </div>
      </Container>
    </section>
  );
}
