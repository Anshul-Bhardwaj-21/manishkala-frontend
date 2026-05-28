import type { WPACFFields, WPACFImage, WPACFReference } from "@/types/wordpress";

export function getAcfValue<T = unknown>(acf: WPACFFields | undefined, keys: string[]): T | undefined {
  if (!acf) {
    return undefined;
  }

  for (const key of keys) {
    const value = acf[key];

    if (value !== undefined && value !== null && value !== "") {
      return value as T;
    }
  }

  return undefined;
}

export function getAcfString(acf: WPACFFields | undefined, keys: string[]): string | undefined {
  const value = getAcfValue(acf, keys);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getAcfStringList(acf: WPACFFields | undefined, keys: string[]): string[] {
  const value = getAcfValue(acf, keys);

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function getAcfImage(acf: WPACFFields | undefined, keys: string[]): WPACFImage | undefined {
  const value = getAcfValue(acf, keys);

  if (typeof value === "string" && value.startsWith("http")) {
    return { url: value };
  }

  if (value && typeof value === "object" && "url" in value && typeof value.url === "string") {
    return value as WPACFImage;
  }

  return undefined;
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getAcfReferenceBlock(
  acf: WPACFFields | undefined
): { label: string; value: WPACFReference[] | string } | undefined {
  const keys = ["references", "notes", "sources", "further_reading"];

  for (const key of keys) {
    const value = getAcfValue<WPACFReference[] | string>(acf, [key]);

    if (value && (!(Array.isArray(value)) || value.length > 0)) {
      return {
        label: humanizeKey(key),
        value
      };
    }
  }

  return undefined;
}
