import { ImageResponse } from "next/og";

import { siteHost } from "@/lib/seo";
import { getSiteInfo } from "@/lib/wordpress";

export const alt = "Open Graph image";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function Image() {
  const identity = await getSiteInfo().catch(() => null);
  const title = identity?.name ?? siteHost();
  const description = identity?.description;

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
          padding: "76px",
          border: "1px solid #ded2c1"
        }}
      >
        <div style={{ fontSize: 24, color: "#8f3f2b" }}>{siteHost()}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 86, lineHeight: 1.02, fontWeight: 700 }}>{title}</div>
          {description ? <div style={{ marginTop: 24, maxWidth: 780, fontSize: 34, lineHeight: 1.25, color: "#766f65" }}>{description}</div> : null}
        </div>
        <div style={{ fontSize: 24, color: "#766f65" }}>{siteHost()}</div>
      </div>
    ),
    size
  );
}
