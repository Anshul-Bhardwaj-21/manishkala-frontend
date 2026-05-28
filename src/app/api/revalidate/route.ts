import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function isAuthorized(request: Request, url: URL): boolean {
  const configuredSecret = process.env.SITE_REVALIDATE_SECRET;
  const providedSecret = url.searchParams.get("secret") ?? request.headers.get("x-revalidate-secret");

  return Boolean(configuredSecret && providedSecret && providedSecret === configuredSecret);
}

function safePath(path: unknown): string | undefined {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : undefined;
}

async function handler(request: Request) {
  const url = new URL(request.url);

  if (!isAuthorized(request, url)) {
    return NextResponse.json({ revalidated: false, message: "Invalid revalidation token." }, { status: 401 });
  }

  let body: Record<string, unknown> = {};

  if (request.method === "POST") {
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }

  const slug = (url.searchParams.get("slug") ?? body.slug) as string | undefined;
  const requestedPath = safePath(url.searchParams.get("path") ?? body.path);
  const paths = new Set(["/", "/blog"]);

  if (slug) {
    paths.add(`/blog/${slug}`);
  }

  if (requestedPath) {
    paths.add(requestedPath);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  revalidateTag("wordpress");
  revalidateTag("posts");
  revalidateTag("pages");
  revalidateTag("menus");
  revalidateTag("categories");
  revalidateTag("site-identity");

  return NextResponse.json({
    revalidated: true,
    paths: Array.from(paths)
  });
}

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
