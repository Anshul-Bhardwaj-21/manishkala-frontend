import type { Metadata, Viewport } from "next";
import { Caveat, Lora, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { absoluteUrl, siteHost, siteUrl } from "@/lib/seo";
import { getSiteInfo } from "@/lib/wordpress";
import "@/styles/globals.css";

const serif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const signature = Caveat({
  subsets: ["latin"],
  variable: "--font-signature",
  display: "swap"
});

export async function generateMetadata(): Promise<Metadata> {
  const identity = await getSiteInfo().catch(() => null);
  const title = identity?.name ?? siteHost();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${title}`
    },
    description: identity?.description,
    alternates: {
      canonical: absoluteUrl("/")
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
    },
    openGraph: {
      type: "website",
      siteName: identity?.name,
      url: absoluteUrl("/"),
      title,
      description: identity?.description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: identity?.description,
      images: ["/opengraph-image"]
    }
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f2ea",
  colorScheme: "light"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${signature.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
