import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";
import { getAboutPage, getAllArticleSlugs, getHomePage } from "@/lib/wordpress";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, home, about] = await Promise.all([
    getAllArticleSlugs().catch(() => []),
    getHomePage().catch(() => null),
    getAboutPage().catch(() => null)
  ]);
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: home?.modified ? new Date(home.modified) : now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    }
  ];

  if (about) {
    staticEntries.push({
      url: absoluteUrl("/about"),
      lastModified: about.modified ? new Date(about.modified) : now,
      changeFrequency: "monthly",
      priority: 0.7
    });
  }

  return [
    ...staticEntries,
    ...articles.map((article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      lastModified: article.modified ? new Date(article.modified) : now,
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))
  ];
}
