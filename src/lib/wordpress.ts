import {
  cleanWordPressHtml,
  isDefaultWordPressPlaceholder,
  looksLikeNavigationOnlyContent,
  meaningfulTextLength,
  stripHtml,
  truncateText
} from "@/lib/content";
import { ACHIEVEMENT_CATEGORY_SLUGS, getLegacyGroupForSlug, LEGACY_ESSAY_GROUPS, STRUCTURAL_PAGE_SLUGS } from "@/lib/legacyEssayGroups";
import { siteUrl } from "@/lib/seo";
import type { ArticleArchive, EssayGroup, FrontendArticle, FrontendCategory, FrontendImage, NavItem, SiteIdentity } from "@/types/content";
import type {
  WPAuthor,
  WPBaseContent,
  WPCategory,
  WPContentSlug,
  WPFeaturedImage,
  WPMedia,
  WPMenuItem,
  WPMenuLocation,
  WPMenuLocationsResponse,
  WPPage,
  WPPost,
  WPRestIndex,
  WPTerm,
  WPYoastHeadJson
} from "@/types/wordpress";

const CONFIGURED_API_URL = process.env.WORDPRESS_API_URL ?? "https://admin.manishkala.in/wp-json";
const API_ROOT = normalizeWpJsonRoot(CONFIGURED_API_URL);
const WORDPRESS_BASE_URL = (process.env.WORDPRESS_BASE_URL ?? "https://admin.manishkala.in").replace(/\/$/, "");
const DEFAULT_REVALIDATE_SECONDS = 300;
const UNCATEGORIZED_SLUG = "uncategorized";
const PUBLIC_SITE_NAME = "Manish Kala";
const GENERIC_WORDPRESS_SITE_NAMES = new Set(["my blog", "site title", "wordpress", "just another wordpress site"]);
const GENERIC_WORDPRESS_DESCRIPTIONS = new Set(["just another wordpress site"]);
const warnedDuplicateSlugs = new Set<string>();

const CONTENT_FIELDS = [
  "id",
  "slug",
  "link",
  "date",
  "modified",
  "title",
  "content",
  "excerpt",
  "author",
  "featured_media",
  "categories",
  "tags",
  "sticky",
  "parent",
  "menu_order",
  "_links",
  "_embedded",
  "acf",
  "yoast_head_json",
  "status"
].join(",");

const MENU_ITEM_FIELDS = ["id", "title", "url", "attr_title", "target", "xfn", "classes", "menus", "object", "object_id", "parent", "menu_order"].join(",");
const CATEGORY_FIELDS = ["id", "count", "description", "link", "name", "slug", "taxonomy", "parent"].join(",");

type QueryValue = string | number | boolean | Array<string | number> | undefined;

interface FetchOptions {
  revalidate?: number;
  tags?: string[];
  cache?: RequestCache;
  authenticated?: boolean;
}

interface WordPressFetchResult<T> {
  data: T;
  headers: Headers;
}

interface ContentFetchOptions {
  preview?: boolean;
}

interface GetPostsOptions extends ContentFetchOptions {
  page?: number;
  perPage?: number;
  categoryId?: number;
}

export class WordPressAPIError extends Error {
  status: number;
  url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "WordPressAPIError";
    this.status = status;
    this.url = url;
  }
}

function normalizeWpJsonRoot(value: string): string {
  return value.replace(/\/+$/, "").replace(/\/wp\/v2$/i, "");
}

function apiUrl(path = "", params: Record<string, QueryValue> = {}): URL {
  const cleanedPath = path.replace(/^\/+/, "");
  const url = cleanedPath ? new URL(cleanedPath, `${API_ROOT}/`) : new URL(API_ROOT);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }

    url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }

  return url;
}

function wpV2Path(path: string): string {
  const cleanedPath = path.replace(/^\/+/, "");
  return cleanedPath.startsWith("wp/v2/") ? cleanedPath : `wp/v2/${cleanedPath}`;
}

function getAuthorizationHeader(): string | undefined {
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD;

  if (!username || !password) {
    return undefined;
  }

  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

async function wpFetch<T>(path = "", params: Record<string, QueryValue> = {}, options: FetchOptions = {}): Promise<WordPressFetchResult<T>> {
  const url = apiUrl(path, params);
  const headers: HeadersInit = {
    Accept: "application/json"
  };

  if (options.authenticated) {
    const authorization = getAuthorizationHeader();

    if (authorization) {
      headers.Authorization = authorization;
    }
  }

  const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    headers
  };

  if (options.cache) {
    init.cache = options.cache;
  }

  if (options.cache !== "no-store") {
    init.next = {
      revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
      tags: ["wordpress", ...(options.tags ?? [])]
    };
  }

  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      const message = `WordPress request failed with ${response.status}`;
      console.error(`[wordpress] GET ${url.toString()} failed: ${message}`);
      throw new WordPressAPIError(message, response.status, url.toString());
    }

    return {
      data: (await response.json()) as T,
      headers: response.headers
    };
  } catch (error) {
    if (!(error instanceof WordPressAPIError)) {
      console.error(`[wordpress] GET ${url.toString()} failed:`, error);
    }

    throw error;
  }
}

function contentFetchOptions(options: ContentFetchOptions = {}): FetchOptions {
  return options.preview
    ? {
        authenticated: true,
        cache: "no-store"
      }
    : {};
}

function previewStatus(options: ContentFetchOptions = {}): string | undefined {
  return options.preview ? "any" : undefined;
}

function previewContext(options: ContentFetchOptions = {}): string | undefined {
  return options.preview ? "edit" : undefined;
}

function clean(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function normalizeSiteName(value: string | undefined): string {
  const cleaned = clean(value);

  if (!cleaned || GENERIC_WORDPRESS_SITE_NAMES.has(cleaned.toLowerCase())) {
    return PUBLIC_SITE_NAME;
  }

  return cleaned;
}

function normalizeSiteDescription(value: string | undefined): string | undefined {
  const cleaned = clean(value);

  if (!cleaned || GENERIC_WORDPRESS_DESCRIPTIONS.has(cleaned.toLowerCase())) {
    return undefined;
  }

  return cleaned;
}

function isPlaceholderContent(content: WPBaseContent): boolean {
  const title = stripHtml(content.title.rendered);
  return isDefaultWordPressPlaceholder(content.slug, title, content.content?.rendered ?? "");
}

function getAvatar(author: WPAuthor | undefined): string | undefined {
  if (!author?.avatar_urls) {
    return undefined;
  }

  const largest = Object.entries(author.avatar_urls).sort(([a], [b]) => Number(b) - Number(a))[0];
  return largest?.[1];
}

async function fetchAllWpV2<T>(path: string, params: Record<string, QueryValue>, tags: string[], options: FetchOptions = {}): Promise<T[]> {
  const firstPage = await wpFetch<T[]>(
    wpV2Path(path),
    {
      ...params,
      page: 1,
      per_page: params.per_page ?? 100
    },
    { ...options, tags: [...tags, ...(options.tags ?? [])] }
  );
  const totalPages = Number(firstPage.headers.get("X-WP-TotalPages") ?? "1");

  if (totalPages <= 1) {
    return firstPage.data;
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      wpFetch<T[]>(
        wpV2Path(path),
        {
          ...params,
          page: index + 2,
          per_page: params.per_page ?? 100
        },
        { ...options, tags: [...tags, ...(options.tags ?? [])] }
      )
    )
  );

  return [firstPage.data, ...rest.map((result) => result.data)].flat();
}

export async function getMediaById(id: number): Promise<WPMedia | null> {
  const { data } = await wpFetch<WPMedia>(
    wpV2Path(`media/${id}`),
    {
      _fields: "id,source_url,alt_text,media_details,title"
    },
    { tags: ["media", `media:${id}`] }
  );

  return data ?? null;
}

export async function getSiteInfo(): Promise<SiteIdentity> {
  const { data } = await wpFetch<WPRestIndex>("", {}, { tags: ["site-identity"] });
  const identity: SiteIdentity = {
    name: normalizeSiteName(data.name),
    description: normalizeSiteDescription(data.description),
    url: clean(data.url),
    home: clean(data.home)
  };

  if (typeof data.site_logo === "number" && data.site_logo > 0) {
    const logo = await getMediaById(data.site_logo).catch(() => null);

    if (logo?.source_url) {
      identity.logo = {
        url: logo.source_url,
        alt: clean(logo.alt_text) ?? identity.name,
        width: logo.media_details?.width,
        height: logo.media_details?.height
      };
    }
  }

  if (!identity.logo && typeof data.site_logo === "string" && data.site_logo.startsWith("http")) {
    identity.logo = {
      url: data.site_logo,
      alt: identity.name
    };
  }

  if (!identity.logo && data.site_icon_url) {
    identity.logo = {
      url: data.site_icon_url,
      alt: identity.name
    };
  }

  return identity;
}

export const getSiteIdentity = getSiteInfo;

export async function getMenuLocations(): Promise<Array<[string, WPMenuLocation]>> {
  const { data } = await wpFetch<WPMenuLocationsResponse>(wpV2Path("menu-locations"), {}, { tags: ["menus"] });

  if (Array.isArray(data)) {
    return data.map((location, index) => [location.name ?? String(index), location]);
  }

  return Object.entries(data);
}

export async function getMenuItems(menuId: number): Promise<WPMenuItem[]> {
  const { data } = await wpFetch<WPMenuItem[]>(
    wpV2Path("menu-items"),
    {
      menus: menuId,
      per_page: 100,
      _fields: MENU_ITEM_FIELDS
    },
    { tags: ["menus", `menu:${menuId}`] }
  );

  return data;
}

export async function getCategories(): Promise<FrontendCategory[]> {
  const data = await fetchAllWpV2<WPCategory>(
    "categories",
    {
      per_page: 100,
      hide_empty: true,
      _fields: CATEGORY_FIELDS
    },
    ["categories"]
  );

  return data
    .filter((category) => category.count > 0)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category.count
    }));
}

export async function getPageBySlug(slug: string, options: ContentFetchOptions = {}): Promise<WPPage | null> {
  const { data } = await wpFetch<WPPage[]>(
    wpV2Path("pages"),
    {
      slug,
      status: previewStatus(options),
      context: previewContext(options),
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    { ...contentFetchOptions(options), tags: ["pages", `page:${slug}`] }
  );

  return data[0] ?? null;
}

export function getHomePage(options: ContentFetchOptions = {}): Promise<WPPage | null> {
  return getPageBySlug("home", options);
}

export function getAboutPage(options: ContentFetchOptions = {}): Promise<WPPage | null> {
  return getPageBySlug("about", options);
}

export function getAchievementsPage(options: ContentFetchOptions = {}): Promise<WPPage | null> {
  return getPageBySlug("achievements", options);
}

export async function getWordPressPosts(options: ContentFetchOptions = {}): Promise<WPPost[]> {
  return fetchAllWpV2<WPPost>(
    "posts",
    {
      status: previewStatus(options),
      context: previewContext(options),
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    ["posts"],
    contentFetchOptions(options)
  ).catch((error) => {
    console.error("[wordpress] Unable to load posts.", error);
    return [];
  });
}

export async function getWordPressPages(options: ContentFetchOptions = {}): Promise<WPPage[]> {
  return fetchAllWpV2<WPPage>(
    "pages",
    {
      status: previewStatus(options),
      context: previewContext(options),
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    ["pages"],
    contentFetchOptions(options)
  ).catch((error) => {
    console.error("[wordpress] Unable to load pages.", error);
    return [];
  });
}

export async function getPostBySlug(slug: string, options: ContentFetchOptions = {}): Promise<WPPost | null> {
  const { data } = await wpFetch<WPPost[]>(
    wpV2Path("posts"),
    {
      slug,
      status: previewStatus(options),
      context: previewContext(options),
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    { ...contentFetchOptions(options), tags: ["posts", `post:${slug}`] }
  );

  return data[0] ?? null;
}

export async function getTopLevelPages(): Promise<WPPage[]> {
  const pages = await getWordPressPages();
  return pages.filter((page) => !STRUCTURAL_PAGE_SLUGS.has(page.slug));
}

function normalizeImage(image: WPFeaturedImage | null): FrontendImage | undefined {
  if (!image) {
    return undefined;
  }

  return {
    url: image.url,
    alt: image.alt,
    width: image.width,
    height: image.height
  };
}

function normalizeAuthor(author: WPAuthor | null): FrontendArticle["author"] {
  if (!author) {
    return undefined;
  }

  return {
    id: author.id,
    name: clean(author.name),
    description: clean(author.description),
    avatarUrl: getAvatar(author)
  };
}

function getAuthor(content: WPBaseContent): WPAuthor | null {
  return content._embedded?.author?.[0] ?? null;
}

function getTerms(content: WPBaseContent): WPTerm[] {
  return content._embedded?.["wp:term"]?.flat() ?? [];
}

function normalizeCategories(content: WPBaseContent): FrontendCategory[] {
  return getTerms(content)
    .filter((term) => term.taxonomy === "category")
    .map((term) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
      count: term.count
    }));
}

function getPrimaryGroup(content: WPBaseContent): EssayGroup | undefined {
  const legacyGroup = getLegacyGroupForSlug(content.slug);

  if (legacyGroup) {
    return {
      label: legacyGroup.label,
      slug: legacyGroup.slug
    };
  }

  const category = normalizeCategories(content).find((item) => item.slug !== UNCATEGORIZED_SLUG && item.name.toLowerCase() !== "uncategorized");

  if (!category) {
    return undefined;
  }

  return {
    label: category.name,
    slug: category.slug
  };
}

function getFeaturedImage(content: WPBaseContent): WPFeaturedImage | null {
  const media = content._embedded?.["wp:featuredmedia"]?.[0];

  if (!media?.source_url) {
    return null;
  }

  return {
    url: media.source_url,
    alt: clean(media.alt_text) ?? clean(media.title?.rendered) ?? "",
    width: media.media_details?.width,
    height: media.media_details?.height
  };
}

function isActualEssay(content: WPBaseContent, sourceType: "post" | "page"): boolean {
  if (isPlaceholderContent(content)) {
    return false;
  }

  if (sourceType === "page" && STRUCTURAL_PAGE_SLUGS.has(content.slug)) {
    return false;
  }

  const title = stripHtml(content.title.rendered);
  const contentHtml = content.content?.rendered ?? "";
  const excerptHtml = content.excerpt?.rendered ?? "";
  const textLength = meaningfulTextLength(contentHtml) || meaningfulTextLength(excerptHtml);

  return Boolean(title && textLength > 0 && !looksLikeNavigationOnlyContent(contentHtml));
}

function normalizeContent(content: WPBaseContent, sourceType: "post" | "page"): FrontendArticle | null {
  if (!isActualEssay(content, sourceType)) {
    return null;
  }

  const title = stripHtml(content.title.rendered);
  const excerptHtml = content.excerpt?.rendered;
  const contentHtml = cleanWordPressHtml(content.content?.rendered ?? "");
  const excerptText = excerptHtml ? truncateText(stripHtml(excerptHtml), 180) : truncateText(stripHtml(contentHtml), 180);

  return {
    id: content.id,
    sourceType,
    slug: content.slug,
    href: `/blog/${content.slug}`,
    title,
    contentHtml,
    excerptHtml,
    excerptText,
    date: content.date,
    modified: content.modified,
    author: normalizeAuthor(getAuthor(content)),
    featuredImage: normalizeImage(getFeaturedImage(content)),
    categories: normalizeCategories(content),
    group: getPrimaryGroup(content),
    acf: content.acf,
    yoast: content.yoast_head_json
  };
}

function normalizePost(post: WPPost): FrontendArticle | null {
  return normalizeContent(post, "post");
}

function normalizePage(page: WPPage): FrontendArticle | null {
  return normalizeContent(page, "page");
}

function articleScore(article: FrontendArticle): number {
  const dateValue = new Date(article.modified ?? article.date ?? 0).getTime();
  const lengthValue = meaningfulTextLength(article.contentHtml);
  return (Number.isFinite(dateValue) ? dateValue : 0) + lengthValue;
}

function sortNewestFirst(articles: FrontendArticle[]): FrontendArticle[] {
  return [...articles].sort((a, b) => {
    const bDate = new Date(b.date ?? b.modified ?? 0).getTime();
    const aDate = new Date(a.date ?? a.modified ?? 0).getTime();
    return (Number.isFinite(bDate) ? bDate : 0) - (Number.isFinite(aDate) ? aDate : 0);
  });
}

function dedupeEssays(articles: FrontendArticle[]): FrontendArticle[] {
  const bySlug = new Map<string, FrontendArticle>();

  for (const article of articles) {
    const existing = bySlug.get(article.slug);

    if (!existing) {
      bySlug.set(article.slug, article);
      continue;
    }

    const preferred = articleScore(article) > articleScore(existing) ? article : existing;
    if (!warnedDuplicateSlugs.has(article.slug)) {
      console.warn(`[wordpress] Duplicate essay slug "${article.slug}" found. Keeping ${preferred.sourceType}:${preferred.id}.`);
      warnedDuplicateSlugs.add(article.slug);
    }
    bySlug.set(article.slug, preferred);
  }

  return Array.from(bySlug.values());
}

export async function getAllEssays(options: ContentFetchOptions = {}): Promise<FrontendArticle[]> {
  const [postResult, pageResult] = await Promise.allSettled([getWordPressPosts(options), getWordPressPages(options)]);
  const posts = postResult.status === "fulfilled" ? postResult.value : [];
  const pages = pageResult.status === "fulfilled" ? pageResult.value : [];
  const normalized = [
    ...posts.map((post) => normalizePost(post)),
    ...pages.map((page) => normalizePage(page))
  ].filter((article): article is FrontendArticle => Boolean(article));

  return sortNewestFirst(dedupeEssays(normalized));
}

export async function getEssayBySlug(slug: string, options: ContentFetchOptions = {}): Promise<FrontendArticle | null> {
  const post = await getPostBySlug(slug, options).catch(() => null);
  const postArticle = post ? normalizePost(post) : null;

  if (postArticle) {
    return postArticle;
  }

  const page = await getPageBySlug(slug, options).catch(() => null);
  return page ? normalizePage(page) : null;
}

export const getArticleBySlug = getEssayBySlug;

export async function getEssaysByGroup(groupSlug: string, options: ContentFetchOptions = {}): Promise<FrontendArticle[]> {
  if (groupSlug === "all") {
    return getAllEssays(options);
  }

  const group = LEGACY_ESSAY_GROUPS.find((item) => item.slug === groupSlug);

  if (!group) {
    const essays = await getAllEssays(options);
    return essays.filter((essay) => essay.group?.slug === groupSlug);
  }

  const essays = await getAllEssays(options);
  const bySlug = new Map(essays.map((essay) => [essay.slug, essay]));
  return group.items.map((slug) => bySlug.get(slug)).filter((essay): essay is FrontendArticle => Boolean(essay));
}

export async function getLatestEssays(limit = 6, options: ContentFetchOptions = {}): Promise<FrontendArticle[]> {
  const essays = await getAllEssays(options);
  return essays.slice(0, limit);
}

export async function getFeaturedEssay(options: ContentFetchOptions = {}): Promise<FrontendArticle | null> {
  const posts = await getWordPressPosts(options);
  const sticky = posts.find((post) => post.sticky);
  const stickyArticle = sticky ? normalizePost(sticky) : null;

  if (stickyArticle) {
    return stickyArticle;
  }

  const latest = await getLatestEssays(1, options);
  return latest[0] ?? null;
}

export const getFeaturedPost = getFeaturedEssay;

function hasAcfFlag(acf: FrontendArticle["acf"], keys: string[]): boolean {
  return keys.some((key) => {
    const value = acf?.[key];

    return value === true || value === 1 || value === "1" || value === "true" || value === "yes";
  });
}

function isAchievementArticle(article: FrontendArticle): boolean {
  return (
    article.categories.some((category) => ACHIEVEMENT_CATEGORY_SLUGS.has(category.slug)) ||
    Boolean(article.group?.slug && ACHIEVEMENT_CATEGORY_SLUGS.has(article.group.slug)) ||
    hasAcfFlag(article.acf, ["drdo_achievement", "drdo_achievements", "featured_achievement", "show_in_achievements"])
  );
}

export async function getAchievementHighlights(limit = 3, options: ContentFetchOptions = {}): Promise<FrontendArticle[]> {
  const essays = await getAllEssays(options);
  return essays.filter(isAchievementArticle).slice(0, limit);
}

export async function getPosts(options: GetPostsOptions = {}): Promise<ArticleArchive> {
  const essays = await getAllEssays(options);
  const currentPage = Math.max(1, Math.floor(options.page ?? 1));
  const perPage = options.perPage ?? 12;
  const filtered = options.categoryId
    ? essays.filter((essay) => essay.categories.some((category) => category.id === options.categoryId))
    : essays;
  const start = (currentPage - 1) * perPage;

  return {
    articles: filtered.slice(start, start + perPage),
    totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
    total: filtered.length,
    currentPage
  };
}

async function getSlugs(path: "posts" | "pages"): Promise<WPContentSlug[]> {
  return fetchAllWpV2<WPContentSlug>(
    path,
    {
      _fields: "slug,modified"
    },
    [path]
  );
}

export async function getAllPostSlugs(): Promise<WPContentSlug[]> {
  return getSlugs("posts").catch(() => []);
}

export async function getAllArticleSlugs(): Promise<WPContentSlug[]> {
  const essays = await getAllEssays().catch(() => []);
  return essays.map((essay) => ({
    slug: essay.slug,
    modified: essay.modified
  }));
}

export async function getRelatedPostsByCategory(categoryId: number, excludeId: number, limit = 3): Promise<FrontendArticle[]> {
  const essays = await getAllEssays();
  return essays
    .filter((essay) => essay.id !== excludeId && essay.categories.some((category) => category.id === categoryId))
    .slice(0, limit);
}

export async function getRelatedEssays(article: FrontendArticle, limit = 3): Promise<FrontendArticle[]> {
  const essays = article.group ? await getEssaysByGroup(article.group.slug) : await getAllEssays();
  return essays.filter((essay) => essay.slug !== article.slug).slice(0, limit);
}

export async function getResolvedLegacyEssayGroups(options: ContentFetchOptions = {}): Promise<Array<EssayGroup & { essays: FrontendArticle[] }>> {
  const essays = await getAllEssays(options);
  const bySlug = new Map(essays.map((essay) => [essay.slug, essay]));
  const groups = LEGACY_ESSAY_GROUPS.map((group) => ({
    label: group.label,
    slug: group.slug,
    essays: group.items.map((slug) => bySlug.get(slug)).filter((essay): essay is FrontendArticle => Boolean(essay))
  }));

  return groups.filter((group) => group.essays.length > 0);
}

export async function getSeoHeadByUrl(url: string): Promise<WPYoastHeadJson | null> {
  const yoastUrl = apiUrl("yoast/v1/get_head", { url });
  const response = await fetch(yoastUrl, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      tags: ["wordpress", "yoast"]
    }
  });

  if (!response.ok) {
    console.error(`[wordpress] Yoast head request failed with ${response.status}: ${yoastUrl.toString()}`);
    return null;
  }

  const data = (await response.json()) as { json?: WPYoastHeadJson };
  return data.json ?? null;
}

function pageHref(page: WPPage): string {
  if (page.slug === "home") {
    return "/";
  }

  if (page.slug === "about") {
    return "/about";
  }

  if (page.slug === "blog" || page.slug === "essays") {
    return "/blog";
  }

  if (page.slug === "achievements") {
    return "/achievements";
  }

  return `/blog/${page.slug}`;
}

function normalizeLocalUrl(rawUrl: string | undefined, object?: string): string | null {
  if (!rawUrl) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(rawUrl, siteUrl);
  } catch {
    return null;
  }

  const publicHost = new URL(siteUrl).hostname;
  const backendHost = new URL(WORDPRESS_BASE_URL).hostname;
  const isLocalHost = parsed.hostname === publicHost || parsed.hostname === backendHost;

  if (!isLocalHost) {
    return parsed.toString();
  }

  const path = parsed.pathname.replace(/\/$/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (object === "category" || segments[0] === "category") {
    return lastSegment ? `/blog?group=${encodeURIComponent(lastSegment)}` : "/blog";
  }

  if (path === "/" || lastSegment === "home") {
    return "/";
  }

  if (lastSegment === "about") {
    return "/about";
  }

  if (lastSegment === "blog" || lastSegment === "essays") {
    return "/blog";
  }

  if (lastSegment === "achievements") {
    return "/achievements";
  }

  return lastSegment ? `/blog/${encodeURIComponent(lastSegment)}` : "/";
}

function normalizeMenuItem(item: WPMenuItem): NavItem | null {
  const label = clean(stripHtml(item.title?.rendered ?? item.attr_title ?? ""));
  const href = normalizeLocalUrl(item.url, item.object);

  if (!label || !href || item.parent) {
    return null;
  }

  return {
    id: String(item.id),
    label,
    href,
    target: item.target || undefined,
    rel: item.target === "_blank" ? "noreferrer" : item.xfn?.join(" ") || undefined
  };
}

function chooseMenuLocation(locations: Array<[string, WPMenuLocation]>, preferred: string[]): WPMenuLocation | undefined {
  const available = locations.filter(([, location]) => Number(location.menu) > 0);

  if (!available.length) {
    return undefined;
  }

  return (
    available.find(([key, location]) => {
      const haystack = `${key} ${location.name ?? ""} ${location.description ?? ""}`.toLowerCase();
      return preferred.some((needle) => haystack.includes(needle));
    })?.[1] ?? available[0][1]
  );
}

async function getMenuNavigation(preferredLocations: string[]): Promise<NavItem[]> {
  const locations = await getMenuLocations();
  const location = chooseMenuLocation(locations, preferredLocations);

  if (!location?.menu) {
    return [];
  }

  const items = await getMenuItems(location.menu);
  return items
    .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
    .map(normalizeMenuItem)
    .filter((item): item is NavItem => Boolean(item));
}

export async function getPrimaryNavigation(): Promise<NavItem[]> {
  return getMenuNavigation(["primary", "main", "header"]).catch(() => []);
}

export async function getFooterNavigation(): Promise<NavItem[]> {
  const menuNavigation = await getMenuNavigation(["footer", "secondary"]).catch(() => []);

  if (menuNavigation.length) {
    return menuNavigation;
  }

  const pages = await Promise.all([getPageBySlug("home").catch(() => null), getPageBySlug("about").catch(() => null)]);
  return pages
    .filter((page): page is WPPage => Boolean(page))
    .map((page) => ({
      id: `page:${page.id}`,
      label: stripHtml(page.title.rendered),
      href: pageHref(page)
    }))
    .filter((item) => item.label);
}
