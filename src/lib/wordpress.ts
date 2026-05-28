import { isDefaultWordPressPlaceholder, stripHtml, truncateText } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
import type { ArticleArchive, FrontendArticle, FrontendCategory, FrontendImage, NavItem, SiteIdentity } from "@/types/content";
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

const API_ROOT = (process.env.WORDPRESS_API_URL ?? "https://admin.manishkala.in/wp-json").replace(/\/$/, "");
const WORDPRESS_BASE_URL = (process.env.WORDPRESS_BASE_URL ?? "https://admin.manishkala.in").replace(/\/$/, "");
const DEFAULT_REVALIDATE_SECONDS = 300;

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

interface GetPostsOptions {
  page?: number;
  perPage?: number;
  categoryId?: number;
  preview?: boolean;
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

function apiUrl(path = "", params: Record<string, QueryValue> = {}): URL {
  const url = new URL(path.replace(/^\/+/, ""), `${API_ROOT}/`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }

    url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }

  return url;
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

  const response = await fetch(url, init);

  if (!response.ok) {
    throw new WordPressAPIError(`WordPress request failed with ${response.status}`, response.status, url.toString());
  }

  return {
    data: (await response.json()) as T,
    headers: response.headers
  };
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

function isSamplePagePlaceholder(page: WPPage): boolean {
  return page.slug === "sample-page" && stripHtml(page.title.rendered).trim().toLowerCase() === "sample page";
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

export async function getMediaById(id: number): Promise<WPMedia | null> {
  const { data } = await wpFetch<WPMedia>(
    `wp/v2/media/${id}`,
    {
      _fields: "id,source_url,alt_text,media_details,title"
    },
    { tags: ["media", `media:${id}`] }
  );

  return data ?? null;
}

export async function getSiteIdentity(): Promise<SiteIdentity> {
  const { data } = await wpFetch<WPRestIndex>("", {}, { tags: ["site-identity"] });
  const identity: SiteIdentity = {
    name: clean(data.name),
    description: clean(data.description),
    url: clean(data.url),
    home: clean(data.home)
  };

  if (typeof data.site_logo === "number") {
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

export async function getMenuLocations(): Promise<Array<[string, WPMenuLocation]>> {
  const { data } = await wpFetch<WPMenuLocationsResponse>("wp/v2/menu-locations", {}, { tags: ["menus"] });

  if (Array.isArray(data)) {
    return data.map((location, index) => [location.name ?? String(index), location]);
  }

  return Object.entries(data);
}

export async function getMenuItems(menuId: number): Promise<WPMenuItem[]> {
  const { data } = await wpFetch<WPMenuItem[]>(
    "wp/v2/menu-items",
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
  const { data } = await wpFetch<WPCategory[]>(
    "wp/v2/categories",
    {
      per_page: 100,
      hide_empty: true,
      _fields: CATEGORY_FIELDS
    },
    { tags: ["categories"] }
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
    "wp/v2/pages",
    {
      slug,
      status: previewStatus(options),
      context: previewContext(options),
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    { ...contentFetchOptions(options), tags: ["pages", `page:${slug}`] }
  );

  const page = data[0] ?? null;
  return page && !isSamplePagePlaceholder(page) ? page : null;
}

export function getHomePage(options: ContentFetchOptions = {}): Promise<WPPage | null> {
  return getPageBySlug("home", options);
}

export function getAboutPage(options: ContentFetchOptions = {}): Promise<WPPage | null> {
  return getPageBySlug("about", options);
}

export async function getTopLevelPages(): Promise<WPPage[]> {
  const { data } = await wpFetch<WPPage[]>(
    "wp/v2/pages",
    {
      per_page: 100,
      parent: 0,
      orderby: "menu_order",
      order: "asc",
      _fields: CONTENT_FIELDS
    },
    { tags: ["pages"] }
  );

  return data.filter((page) => !isSamplePagePlaceholder(page));
}

export async function getPosts(options: GetPostsOptions = {}): Promise<ArticleArchive> {
  const currentPage = Math.max(1, Math.floor(options.page ?? 1));
  const { data, headers } = await wpFetch<WPPost[]>(
    "wp/v2/posts",
    {
      page: currentPage,
      per_page: options.perPage ?? 12,
      categories: options.categoryId,
      status: previewStatus(options),
      context: previewContext(options),
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    { ...contentFetchOptions(options), tags: ["posts"] }
  );

  return {
    articles: data.map((post) => normalizePost(post)).filter((article): article is FrontendArticle => Boolean(article)),
    totalPages: Number(headers.get("X-WP-TotalPages") ?? "1"),
    total: Number(headers.get("X-WP-Total") ?? data.length),
    currentPage
  };
}

export async function getPostBySlug(slug: string, options: ContentFetchOptions = {}): Promise<WPPost | null> {
  const { data } = await wpFetch<WPPost[]>(
    "wp/v2/posts",
    {
      slug,
      status: previewStatus(options),
      context: previewContext(options),
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    { ...contentFetchOptions(options), tags: ["posts", `post:${slug}`] }
  );

  const post = data[0] ?? null;
  return post && !isPlaceholderContent(post) ? post : null;
}

export async function getArticleBySlug(slug: string, options: ContentFetchOptions = {}): Promise<FrontendArticle | null> {
  const post = await getPostBySlug(slug, options).catch(() => null);

  if (post) {
    return normalizePost(post);
  }

  const page = await getPageBySlug(slug, options).catch(() => null);
  return page ? normalizePage(page) : null;
}

async function getSlugs(path: "wp/v2/posts" | "wp/v2/pages"): Promise<WPContentSlug[]> {
  const firstPage = await wpFetch<WPContentSlug[]>(
    path,
    {
      page: 1,
      per_page: 100,
      _fields: "slug,modified"
    },
    { tags: [path.endsWith("posts") ? "posts" : "pages"] }
  );
  const totalPages = Number(firstPage.headers.get("X-WP-TotalPages") ?? "1");

  if (totalPages <= 1) {
    return firstPage.data;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      wpFetch<WPContentSlug[]>(
        path,
        {
          page: index + 2,
          per_page: 100,
          _fields: "slug,modified"
        },
        { tags: [path.endsWith("posts") ? "posts" : "pages"] }
      )
    )
  );

  return [firstPage.data, ...remainingPages.map((result) => result.data)].flat();
}

export async function getAllPostSlugs(): Promise<WPContentSlug[]> {
  return getSlugs("wp/v2/posts");
}

export async function getAllArticleSlugs(): Promise<WPContentSlug[]> {
  const [posts, pages] = await Promise.all([getSlugs("wp/v2/posts").catch(() => []), getSlugs("wp/v2/pages").catch(() => [])]);
  const routedPageSlugs = new Set(["home", "about", "blog", "sample-page"]);
  const seen = new Set<string>();
  const merged: WPContentSlug[] = [];

  for (const item of [...posts, ...pages.filter((page) => !routedPageSlugs.has(page.slug))]) {
    if (!seen.has(item.slug)) {
      seen.add(item.slug);
      merged.push(item);
    }
  }

  return merged;
}

export async function getRelatedPostsByCategory(categoryId: number, excludeId: number, limit = 3): Promise<FrontendArticle[]> {
  const { data } = await wpFetch<WPPost[]>(
    "wp/v2/posts",
    {
      per_page: limit,
      categories: categoryId,
      exclude: excludeId,
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    { tags: ["posts", `category:${categoryId}`] }
  );

  return data.map((post) => normalizePost(post)).filter((article): article is FrontendArticle => Boolean(article));
}

export async function getFeaturedPost(): Promise<FrontendArticle | null> {
  const sticky = await wpFetch<WPPost[]>(
    "wp/v2/posts",
    {
      sticky: true,
      per_page: 1,
      _embed: true,
      _fields: CONTENT_FIELDS
    },
    { tags: ["posts"] }
  ).catch(() => null);

  const stickyArticle = sticky?.data.map((post) => normalizePost(post)).find(Boolean);

  if (stickyArticle) {
    return stickyArticle;
  }

  const archive = await getPosts({ page: 1, perPage: 1 }).catch(() => null);
  return archive?.articles[0] ?? null;
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
    return null;
  }

  const data = (await response.json()) as { json?: WPYoastHeadJson };
  return data.json ?? null;
}

export function getFeaturedImage(content: WPBaseContent): WPFeaturedImage | null {
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

export function getAuthor(content: WPBaseContent): WPAuthor | null {
  return content._embedded?.author?.[0] ?? null;
}

export function getTerms(content: WPBaseContent): WPTerm[] {
  return content._embedded?.["wp:term"]?.flat() ?? [];
}

export function getPrimaryTerm(content: WPBaseContent): WPTerm | null {
  const terms = getTerms(content);
  return terms.find((term) => term.taxonomy === "category") ?? terms.find((term) => term.taxonomy === "post_tag") ?? null;
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

function normalizeContent(content: WPBaseContent, sourceType: "post" | "page"): FrontendArticle | null {
  if (isPlaceholderContent(content)) {
    return null;
  }

  const title = stripHtml(content.title.rendered);

  if (!title) {
    return null;
  }

  const excerptHtml = content.excerpt?.rendered;
  const contentHtml = content.content?.rendered ?? "";
  const excerptText = excerptHtml ? truncateText(stripHtml(excerptHtml), 180) : undefined;

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
    acf: content.acf,
    yoast: content.yoast_head_json
  };
}

function normalizePost(post: WPPost): FrontendArticle | null {
  return normalizeContent(post, "post");
}

function normalizePage(page: WPPage): FrontendArticle | null {
  if (isSamplePagePlaceholder(page)) {
    return null;
  }

  return normalizeContent(page, "page");
}

function pageHref(page: WPPage): string {
  if (page.slug === "home") {
    return "/";
  }

  if (page.slug === "about") {
    return "/about";
  }

  if (page.slug === "blog") {
    return "/blog";
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
    return lastSegment ? `/blog?category=${encodeURIComponent(lastSegment)}` : "/blog";
  }

  if (path === "/" || lastSegment === "home") {
    return "/";
  }

  if (lastSegment === "about") {
    return "/about";
  }

  if (lastSegment === "blog") {
    return "/blog";
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

async function getFallbackNavigation(): Promise<NavItem[]> {
  const [pages, categories] = await Promise.all([getTopLevelPages().catch(() => []), getCategories().catch(() => [])]);
  const pageItems = pages
    .map((page) => {
      const label = clean(stripHtml(page.title.rendered));

      if (!label) {
        return null;
      }

      return {
        id: `page:${page.id}`,
        label,
        href: pageHref(page)
      };
    })
    .filter((item): item is NavItem => Boolean(item));

  const categoryItems = categories.map((category) => ({
    id: `category:${category.id}`,
    label: category.name,
    href: `/blog?category=${encodeURIComponent(category.slug)}`
  }));

  return [...pageItems, ...categoryItems];
}

export async function getPrimaryNavigation(): Promise<NavItem[]> {
  const menuNavigation = await getMenuNavigation(["primary", "main", "header"]).catch(() => []);
  return menuNavigation.length ? menuNavigation : getFallbackNavigation();
}

export async function getFooterNavigation(): Promise<NavItem[]> {
  const menuNavigation = await getMenuNavigation(["footer", "secondary"]).catch(() => []);
  return menuNavigation.length ? menuNavigation : getFallbackNavigation();
}
