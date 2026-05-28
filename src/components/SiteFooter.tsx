import Link from "next/link";

import { Container } from "@/components/Container";
import { getFooterNavigation, getSiteIdentity } from "@/lib/wordpress";

export async function SiteFooter() {
  const [identityResult, navigationResult] = await Promise.allSettled([getSiteIdentity(), getFooterNavigation()]);
  const identity = identityResult.status === "fulfilled" ? identityResult.value : null;
  const navigation = navigationResult.status === "fulfilled" ? navigationResult.value : [];

  return (
    <footer className="mt-24 border-t border-hairline py-10">
      <Container>
        <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
          {identity?.name || identity?.description ? (
            <div>
              {identity.name ? <p className="font-serif text-2xl font-semibold text-ink">{identity.name}</p> : null}
              {identity.description ? <p className="mt-2 max-w-md text-sm leading-6 text-muted">{identity.description}</p> : null}
            </div>
          ) : null}
          {navigation.length ? (
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap gap-4 text-sm font-bold text-muted">
                {navigation.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} target={item.target} rel={item.rel} className="transition-colors hover:text-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
