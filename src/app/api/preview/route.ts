import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

function previewPath(type: string | null, slug: string): string {
  if (type === "page") {
    if (slug === "home") {
      return "/";
    }

    if (slug === "about") {
      return "/about";
    }

    if (slug === "blog") {
      return "/blog";
    }

    return `/blog/${slug}`;
  }

  return `/blog/${slug}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const slug = url.searchParams.get("slug");
  const type = url.searchParams.get("type");

  if (!process.env.WORDPRESS_PREVIEW_SECRET || secret !== process.env.WORDPRESS_PREVIEW_SECRET) {
    return NextResponse.json({ enabled: false, message: "Invalid preview token." }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ enabled: false, message: "Missing slug." }, { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(previewPath(type, slug));
}
