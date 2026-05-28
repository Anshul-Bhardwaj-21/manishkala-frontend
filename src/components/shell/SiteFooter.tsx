import Link from "next/link";

import { Container } from "@/components/Container";
import { getSiteInfo } from "@/lib/wordpress";

export async function SiteFooter() {
  const site = await getSiteInfo().catch(() => null);
  const displayName = site?.name || "Manish Kala";

  return (
    <footer className="mt-24 border-t border-hairline bg-linen/25 py-10">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-2xl font-semibold text-ink">{displayName}</p>
            {site?.description ? <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{site.description}</p> : null}
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-5 text-sm font-bold text-muted">
              <li>
                <Link href="/" className="hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-accent">
                  Writings
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
