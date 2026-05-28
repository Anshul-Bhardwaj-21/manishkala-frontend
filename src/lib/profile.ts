import { getAcfValue } from "@/lib/acf";
import type { WPACFFields, WPACFValue } from "@/types/wordpress";

export interface ProfileContactLink {
  label: string;
  value: string;
  href: string;
}

function clean(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function valueToString(value: WPACFValue | undefined): string | undefined {
  if (typeof value === "string") {
    return clean(value);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const objectValue = value as Record<string, WPACFValue>;
    return valueToString(objectValue.url) ?? valueToString(objectValue.value) ?? valueToString(objectValue.title);
  }

  return undefined;
}

function firstString(acf: WPACFFields | undefined, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = valueToString(getAcfValue<WPACFValue>(acf, [key]));

    if (value) {
      return value;
    }
  }

  return undefined;
}

function absoluteUrl(value: string): string | undefined {
  try {
    return new URL(value).toString();
  } catch {
    return undefined;
  }
}

function socialLink(label: string, baseUrl: string, value: string | undefined): ProfileContactLink | undefined {
  if (!value) {
    return undefined;
  }

  const url = absoluteUrl(value);
  const handle = url
    ? new URL(url).pathname.split("/").filter(Boolean)[0]
    : value
        .replace(/^@/, "")
        .replace(/^https?:\/\/(www\.)?/i, "")
        .replace(/^(facebook|fb|instagram)\.com\//i, "")
        .split(/[/?#]/)[0];

  if (!handle && !url) {
    return undefined;
  }

  return {
    label,
    value: handle ? `@${handle}` : new URL(url as string).hostname.replace(/^www\./, ""),
    href: url ?? `${baseUrl}/${handle}`
  };
}

function instagramLink(value: string | undefined): ProfileContactLink | undefined {
  return socialLink("Instagram", "https://www.instagram.com", value);
}

function facebookLink(value: string | undefined): ProfileContactLink | undefined {
  return socialLink("Facebook", "https://www.facebook.com", value);
}

function phoneLink(value: string | undefined): ProfileContactLink | undefined {
  if (!value) {
    return undefined;
  }

  const dialable = value.replace(/[^\d+]/g, "");

  if (!dialable) {
    return undefined;
  }

  return {
    label: "Phone",
    value,
    href: `tel:${dialable}`
  };
}

function emailLink(value: string | undefined): ProfileContactLink | undefined {
  if (!value || !value.includes("@")) {
    return undefined;
  }

  return {
    label: "Email",
    value,
    href: `mailto:${value}`
  };
}

function externalLink(label: string, value: string | undefined): ProfileContactLink | undefined {
  if (!value) {
    return undefined;
  }

  const href = absoluteUrl(value);

  if (!href) {
    return undefined;
  }

  return {
    label,
    value: new URL(href).hostname.replace(/^www\./, ""),
    href
  };
}

export function getProfileContactLinks(acf: WPACFFields | undefined): ProfileContactLink[] {
  const links = [
    facebookLink(firstString(acf, ["facebook_url", "facebook_profile", "facebook", "fb_url"])),
    instagramLink(firstString(acf, ["instagram_url", "instagram_handle", "instagram", "instagram_username"])),
    phoneLink(firstString(acf, ["phone", "phone_number", "mobile", "contact_number", "contact_phone"])),
    emailLink(firstString(acf, ["email", "email_address", "contact_email"])),
    externalLink("LinkedIn", firstString(acf, ["linkedin_url", "linkedin"])),
    externalLink("Website", firstString(acf, ["website", "personal_website"]))
  ].filter((link): link is ProfileContactLink => Boolean(link));

  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) {
      return false;
    }

    seen.add(link.href);
    return true;
  });
}

export function getProfileAchievementsHtml(acf: WPACFFields | undefined): string | undefined {
  return firstString(acf, ["drdo_achievements", "career_highlights", "professional_highlights", "achievements"]);
}

export function getProfileAboutHtml(acf: WPACFFields | undefined): string | undefined {
  return firstString(acf, ["about_me", "profile_bio", "biography", "bio", "about"]);
}
