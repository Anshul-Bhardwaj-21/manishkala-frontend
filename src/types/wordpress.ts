export interface WPRendered {
  rendered: string;
}

export type WPACFPrimitive = string | number | boolean | null;
export type WPACFValue =
  | WPACFPrimitive
  | WPACFValue[]
  | {
      [key: string]: WPACFValue;
    };

export interface WPACFImage {
  id?: number;
  url: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

export interface WPACFReference {
  title?: string;
  url?: string;
  source?: string;
  note?: string;
}

export interface WPACFFields extends Record<string, WPACFValue | WPACFImage | WPACFReference[] | undefined> {
  subtitle?: string;
  deck?: string;
  dek?: string;
  summary?: string;
  references?: WPACFReference[] | string;
  notes?: WPACFReference[] | string;
  sources?: WPACFReference[] | string;
  featured_quote?: string;
  portrait?: WPACFImage | string;
  photo?: WPACFImage | string;
}

export interface WPYoastImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface WPYoastRobots {
  index?: string;
  follow?: string;
  "max-snippet"?: string;
  "max-image-preview"?: string;
  "max-video-preview"?: string;
}

export interface WPYoastHeadJson {
  title?: string;
  description?: string;
  canonical?: string;
  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_site_name?: string;
  article_published_time?: string;
  article_modified_time?: string;
  author?: string;
  og_image?: WPYoastImage[];
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  robots?: WPYoastRobots;
}

export interface WPMediaSize {
  file?: string;
  width?: number;
  height?: number;
  mime_type?: string;
  source_url?: string;
}

export interface WPMediaDetails {
  width?: number;
  height?: number;
  sizes?: Record<string, WPMediaSize>;
}

export interface WPFeaturedMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  caption?: WPRendered;
  media_details?: WPMediaDetails;
  title?: WPRendered;
}

export interface WPAuthor {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  avatar_urls?: Record<string, string>;
}

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
  link?: string;
  count?: number;
}

export interface WPEmbedded {
  author?: WPAuthor[];
  "wp:featuredmedia"?: WPFeaturedMedia[];
  "wp:term"?: WPTerm[][];
}

export interface WPBaseContent {
  id: number;
  slug: string;
  link?: string;
  date?: string;
  modified?: string;
  title: WPRendered;
  content?: WPRendered;
  excerpt?: WPRendered;
  author?: number;
  featured_media?: number;
  _links?: Record<string, unknown>;
  _embedded?: WPEmbedded;
  acf?: WPACFFields;
  yoast_head_json?: WPYoastHeadJson;
  status?: string;
}

export interface WPPost extends WPBaseContent {
  type?: "post";
  date: string;
  excerpt: WPRendered;
  content?: WPRendered;
  categories?: number[];
  tags?: number[];
  sticky?: boolean;
}

export interface WPPage extends WPBaseContent {
  type?: "page";
  content: WPRendered;
  parent?: number;
  menu_order?: number;
}

export interface WPCategory {
  id: number;
  count: number;
  description?: string;
  link?: string;
  name: string;
  slug: string;
  taxonomy: "category";
  parent?: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: WPMediaDetails;
  title?: WPRendered;
}

export interface WPRestIndex {
  name?: string;
  description?: string;
  url?: string;
  home?: string;
  site_logo?: number | string;
  site_icon?: number;
  site_icon_url?: string;
  routes?: Record<string, unknown>;
}

export interface WPMenuLocation {
  name?: string;
  description?: string;
  menu?: number;
}

export type WPMenuLocationsResponse = Record<string, WPMenuLocation> | WPMenuLocation[];

export interface WPMenuItem {
  id: number;
  title?: WPRendered;
  url?: string;
  attr_title?: string;
  target?: string;
  xfn?: string[];
  classes?: string[];
  menus?: number;
  object?: string;
  object_id?: number;
  parent?: number;
  menu_order?: number;
}

export interface WPContentSlug {
  slug: string;
  modified?: string;
}

export interface WPFeaturedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}
