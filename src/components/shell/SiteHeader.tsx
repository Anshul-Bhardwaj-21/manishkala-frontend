import Link from "next/link";

import { Container } from "@/components/Container";
import { MegaMenu } from "@/components/shell/MegaMenu";
import { MobileMenu } from "@/components/shell/MobileMenu";
import { getResolvedLegacyEssayGroups, getSiteInfo } from "@/lib/wordpress";

export async function SiteHeader() {
  const [siteResult, groupsResult] = await Promise.allSettled([getSiteInfo(), getResolvedLegacyEssayGroups()]);
  const site = siteResult.status === "fulfilled" ? siteResult.value : null;
  const groups = groupsResult.status === "fulfilled" ? groupsResult.value : [];
  const displayName = site?.name || "Manish Kala";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur-xl">
      <Container className="relative">
        <div className="flex min-h-[72px] items-center justify-between gap-8">
          <Link href="/" className="group/brand inline-flex min-h-12 items-center gap-3 text-ink transition-colors hover:text-accent">
            <span
              className="inline-flex h-10 w-10 items-center justify-center border border-ink/20 bg-linen font-serif text-sm font-semibold tracking-[0.16em] text-ink transition-colors group-hover/brand:border-accent group-hover/brand:text-accent"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="font-serif text-2xl font-semibold tracking-normal">{displayName}</span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:block">
            <ul className="flex items-center gap-2 text-sm font-bold text-muted">
              <li>
                <Link href="/" className="inline-flex min-h-10 items-center px-3 transition-colors hover:text-ink">
                  Home
                </Link>
              </li>
              <li className="group relative">
                <Link href="/blog" className="inline-flex min-h-[72px] items-center px-3 transition-colors hover:text-ink">
                  Writings
                </Link>
                <MegaMenu groups={groups} />
              </li>
              <li>
                <Link href="/achievements" className="inline-flex min-h-10 items-center px-3 transition-colors hover:text-ink">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex min-h-10 items-center px-3 transition-colors hover:text-ink">
                  About
                </Link>
              </li>
            </ul>
          </nav>

          <MobileMenu groups={groups} />
        </div>
      </Container>
    </header>
  );
}
