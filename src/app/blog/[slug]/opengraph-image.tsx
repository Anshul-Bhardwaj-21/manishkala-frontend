import { ImageResponse } from "next/og";

import { siteHost } from "@/lib/seo";
import { getEssayBySlug, getSiteInfo } from "@/lib/wordpress";

export const alt = "Open Graph image";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

interface OgImageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Image({ params }: OgImageProps) {
  const { slug } = await params;
  const [article, identity] = await Promise.all([
    getEssayBySlug(decodeURIComponent(slug)).catch(() => null),
    getSiteInfo().catch(() => null)
  ]);
  const title = article?.title ?? identity?.name ?? siteHost();
  const category = article?.group?.label;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f2ea",
          color: "#23211d",
          padding: "72px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#8f3f2b", fontSize: 24 }}>
          <span>{category}</span>
          <span>{siteHost()}</span>
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: title.length > 74 ? 58 : 72, lineHeight: 1.08, fontWeight: 700, maxWidth: 980 }}>
          {title}
        </div>
        {identity?.name ? <div style={{ fontSize: 30, color: "#766f65" }}>{identity.name}</div> : null}
      </div>
    ),
    size
  );
}
