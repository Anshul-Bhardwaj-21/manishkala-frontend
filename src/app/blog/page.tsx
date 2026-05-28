import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InlineNotice } from "@/components/ApiNotice";
import { Container } from "@/components/Container";
import { EssayFilters } from "@/components/blog/EssayFilters";
import { EssayGrid } from "@/components/blog/EssayGrid";
import { Pagination } from "@/components/Pagination";
import { LEGACY_ESSAY_GROUPS } from "@/lib/legacyEssayGroups";
import { metadataFromYoast } from "@/lib/seo";
import { getAllEssays, getEssaysByGroup, getPageBySlug, getSiteInfo } from "@/lib/wordpress";

export const revalidate = 300;

interface BlogPageProps {
  searchParams?: Promise<{
    page?: string;
    group?: string;
  }>;
}

const perPage = 12;

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function isKnownGroup(slug: string | undefined): boolean {
  return Boolean(slug && LEGACY_ESSAY_GROUPS.some((group) => group.slug === slug));
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeGroup = resolvedSearchParams.group;
  const [site, page] = await Promise.all([getSiteInfo().catch(() => null), getPageBySlug("blog").catch(() => null)]);
  const group = activeGroup ? LEGACY_ESSAY_GROUPS.find((item) => item.slug === activeGroup) : undefined;

  return metadataFromYoast(
    page?.yoast_head_json,
    {
      title: group?.label ?? "Writings",
      description: site?.description,
      path: activeGroup ? `/blog?group=${encodeURIComponent(activeGroup)}` : "/blog"
    },
    site
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentPage = parsePage(resolvedSearchParams.page);
  const activeGroup = resolvedSearchParams.group;

  if (activeGroup && !isKnownGroup(activeGroup)) {
    notFound();
  }

  const essays = activeGroup ? await getEssaysByGroup(activeGroup).catch(() => []) : await getAllEssays().catch(() => []);
  const totalPages = Math.max(1, Math.ceil(essays.length / perPage));

  if (currentPage > totalPages && essays.length > 0) {
    notFound();
  }

  const group = activeGroup ? LEGACY_ESSAY_GROUPS.find((item) => item.slug === activeGroup) : undefined;
  const paginatedEssays = essays.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="border-t border-hairline pt-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Writings</p>
              <h1 className="mt-4 text-balance font-serif text-5xl font-semibold leading-[1.04] text-ink md:text-6xl">
                {group?.label ?? "Writings"}
              </h1>
            </div>
            {essays.length ? (
              <p className="border-l border-hairline pl-5 text-sm font-bold uppercase tracking-[0.14em] text-muted">
                {essays.length} {essays.length === 1 ? "writing" : "writings"}
              </p>
            ) : null}
          </div>
          <div className="mt-8">
            <EssayFilters activeGroup={activeGroup} />
          </div>
        </div>
      </Container>

      <Container className="mt-12">
        {paginatedEssays.length ? (
          <>
            <EssayGrid essays={paginatedEssays} />
            <Pagination currentPage={currentPage} totalPages={totalPages} query={{ group: activeGroup }} />
          </>
        ) : (
          <InlineNotice>No writings were returned by WordPress for this view.</InlineNotice>
        )}
      </Container>
    </section>
  );
}
