import type { WPACFFields, WPYoastHeadJson } from "@/types/wordpress";

export interface SiteIdentity {
  name?: string;
  description?: string;
  url?: string;
  home?: string;
  logo?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  target?: string;
  rel?: string;
}

export interface FrontendAuthor {
  id?: number;
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export interface FrontendCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface FrontendImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface FrontendArticle {
  id: number;
  sourceType: "post" | "page";
  slug: string;
  href: string;
  title: string;
  contentHtml: string;
  excerptHtml?: string;
  excerptText?: string;
  date?: string;
  modified?: string;
  author?: FrontendAuthor;
  featuredImage?: FrontendImage;
  categories: FrontendCategory[];
  acf?: WPACFFields;
  yoast?: WPYoastHeadJson;
}

export interface ArticleArchive {
  articles: FrontendArticle[];
  totalPages: number;
  total: number;
  currentPage: number;
}
