import type { Metadata } from "next";

import type { SiteIdentity } from "@/types/content";
import type { WPYoastHeadJson } from "@/types/wordpress";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://manishkala.in").replace(/\/$/, "");

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteUrl}/`).toString();
}

export function siteHost(): string {
  return new URL(siteUrl).hostname;
}

interface MetadataFallback {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

function firstText(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value && value.trim().length > 0)?.trim();
}

function yoastImages(yoast: WPYoastHeadJson | undefined, identity: SiteIdentity | null, fallbackTitle: string): NonNullable<Metadata["openGraph"]>["images"] {
  if (!yoast?.og_image?.length) {
    return undefined;
  }

  return yoast.og_image
    .filter((image) => Boolean(image.url))
    .map((image) => ({
      url: image.url,
      width: image.width,
      height: image.height,
      alt: image.alt ?? identity?.name ?? fallbackTitle
    }));
}

export function metadataFromYoast(yoast: WPYoastHeadJson | undefined, fallback: MetadataFallback, identity: SiteIdentity | null = null): Metadata {
  const title = firstText(yoast?.title, yoast?.og_title, fallback.title, identity?.name, siteHost());
  const description = firstText(yoast?.description, yoast?.og_description, fallback.description, identity?.description);
  const canonical = absoluteUrl(fallback.path);
  const images = yoastImages(yoast, identity, title ?? siteHost()) ?? [
    {
      url: fallback.image ?? "/opengraph-image",
      width: 1200,
      height: 630,
      alt: title ?? identity?.name ?? siteHost()
    }
  ];
  const robots = yoast?.robots
    ? {
        index: yoast.robots.index !== "noindex",
        follow: yoast.robots.follow !== "nofollow"
      }
    : undefined;

  const baseOpenGraph = {
    title,
    description,
    url: canonical,
    siteName: identity?.name,
    locale: yoast?.og_locale,
    images
  };

  const openGraph =
    fallback.openGraphType === "article" || yoast?.og_type === "article"
      ? {
          ...baseOpenGraph,
          type: "article" as const,
          publishedTime: yoast?.article_published_time ?? fallback.publishedTime,
          modifiedTime: yoast?.article_modified_time ?? fallback.modifiedTime,
          authors: fallback.authors
        }
      : {
          ...baseOpenGraph,
          type: "website" as const
        };

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: yoast?.twitter_title ?? title,
      description: yoast?.twitter_description ?? description,
      images: yoast?.twitter_image ? [yoast.twitter_image] : images
    },
    robots
  };
}
