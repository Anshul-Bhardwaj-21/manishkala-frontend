export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: "\""
};

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (entity, code: string) => {
    if (code[0] === "#") {
      const isHex = code[1]?.toLowerCase() === "x";
      const parsed = Number.parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : entity;
    }

    return namedEntities[code] ?? entity;
  });
}

export function stripHtml(html = ""): string {
  return decodeHtmlEntities(
    cleanWordPressHtml(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function cleanWordPressHtml(html = ""): string {
  const legacyUiClassOrId =
    "(?:wp-block-navigation|wp-block-comments|comments-area|comment-respond|comment-form|sharedaddy|sd-sharing|jp-sharing|wp-block-jetpack|wpcom|wpadminbar|post-edit-link|edit-link|akismet|wpl-likebox|wpcnt)";

  return html
    .replace(/<!--\s*wp:[\s\S]*?-->/gi, "")
    .replace(/<!--\s*\/wp:[\s\S]*?-->/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(new RegExp(`<([a-z0-9-]+)(?=[^>]*(?:class|id)=["'][^"']*${legacyUiClassOrId})[^>]*>[\\s\\S]*?<\\/\\1>`, "gi"), "")
    .replace(/<a[^>]*(?:class|id)=["'][^"']*(?:post-edit-link|edit-link)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<p[^>]*>\s*(?:Share this:|Like this:)[\s\S]*?<\/p>/gi, "")
    .replace(/<h[1-6][^>]*>\s*(?:Leave a Reply|Comments?)\s*<\/h[1-6]>/gi, "")
    .replace(/<form[^>]*(?:comment|akismet|respond)[^>]*>[\s\S]*?<\/form>/gi, "")
    .replace(/<iframe[^>]*(?:wpcom|wordpress|sharing|like)[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\b(?:Share this:|Like this:|Leave a Reply|Notify me of new comments via email\.?|Notify me of new posts via email\.|This site uses Akismet[\s\S]*?spam\.)\b/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .trim();
}

export function looksLikeNavigationOnlyContent(html = ""): boolean {
  const lower = html.toLowerCase();
  const text = stripHtml(html);

  return (
    lower.includes("wp:navigation") ||
    lower.includes("wp:navigation-submenu") ||
    (text.length < 80 && /menu|navigation/i.test(text))
  );
}

export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  const clipped = value.slice(0, maxLength).replace(/\s+\S*$/, "");
  return `${clipped.trim()}...`;
}

export function isDefaultWordPressPlaceholder(slug: string, title: string, content = ""): boolean {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedContent = stripHtml(content).trim().toLowerCase();

  return (
    slug === "hello-world" &&
    normalizedTitle === "hello world!" &&
    normalizedContent.includes("welcome to wordpress")
  );
}

export function meaningfulTextLength(html = ""): number {
  return stripHtml(html).replace(/\s+/g, " ").trim().length;
}

export function calculateReadingTime(html = "", wordsPerMinute = 225): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

export function initialsFromName(name: string | undefined): string {
  if (!name) {
    return "";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || "section";
}

function uniqueSlug(base: string, counts: Map<string, number>): string {
  const count = counts.get(base) ?? 0;
  counts.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

export function extractHeadings(html = ""): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  const counts = new Map<string, number>();
  const headingRegex = /<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const attributes = match[2] ?? "";
    const idMatch = attributes.match(/\sid=["']([^"']+)["']/i);
    const text = stripHtml(match[3] ?? "");
    const id = idMatch?.[1] ?? uniqueSlug(slugify(text), counts);

    if (text) {
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export function addHeadingIds(html = ""): string {
  const counts = new Map<string, number>();

  return html.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level: string, attributes: string, inner: string) => {
    if (/\sid=["'][^"']+["']/i.test(attributes)) {
      return full;
    }

    const text = stripHtml(inner);
    const id = uniqueSlug(slugify(text), counts);
    return `<h${level}${attributes} id="${id}">${inner}</h${level}>`;
  });
}
