import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/Container";
import { getPrimaryNavigation, getSiteIdentity } from "@/lib/wordpress";

export async function SiteHeader() {
  const [identityResult, navigationResult] = await Promise.allSettled([getSiteIdentity(), getPrimaryNavigation()]);
  const identity = identityResult.status === "fulfilled" ? identityResult.value : null;
  const navigation = navigationResult.status === "fulfilled" ? navigationResult.value : [];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/92 backdrop-blur">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-6">
          {identity?.name || identity?.logo ? (
            <Link href="/" className="flex min-h-10 items-center gap-3 text-ink transition-colors hover:text-accent">
              {identity.logo ? (
                <Image
                  src={identity.logo.url}
                  alt={identity.logo.alt ?? identity.name ?? ""}
                  width={identity.logo.width ?? 160}
                  height={identity.logo.height ?? 48}
                  className="max-h-10 w-auto object-contain"
                  priority
                />
              ) : null}
              {identity.name ? <span className="font-serif text-xl font-semibold">{identity.name}</span> : null}
            </Link>
          ) : (
            <div />
          )}
          {navigation.length ? (
            <nav aria-label="Primary navigation">
              <ul className="flex items-center gap-1 sm:gap-2">
                {navigation.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      target={item.target}
                      rel={item.rel}
                      className="inline-flex min-h-10 items-center px-3 text-sm font-bold text-muted transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
