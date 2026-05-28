"use client";

import Link from "next/link";
import { useState } from "react";

import type { ResolvedEssayGroup } from "@/components/shell/MegaMenu";

export function MobileMenu({ groups }: { groups: ResolvedEssayGroup[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center border border-hairline bg-linen/55 text-ink transition-colors hover:border-accent hover:text-accent"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
          <span className={open ? "h-px bg-current transition-transform translate-y-[7px] rotate-45" : "h-px bg-current transition-transform"} />
          <span className={open ? "h-px bg-current opacity-0 transition-opacity" : "h-px bg-current transition-opacity"} />
          <span className={open ? "h-px bg-current transition-transform -translate-y-[7px] -rotate-45" : "h-px bg-current transition-transform"} />
        </span>
      </button>

      {open ? (
        <div id="mobile-menu" className="absolute inset-x-0 top-full z-50 border-b border-hairline bg-paper px-5 py-5 shadow-editorial">
          <nav aria-label="Mobile navigation">
            <ul className="space-y-1">
              <li>
                <Link href="/" className="block border-b border-hairline px-1 py-3 text-base font-bold text-ink" onClick={() => setOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <details className="group/details">
                  <summary className="cursor-pointer list-none border-b border-hairline px-1 py-3 text-base font-bold text-ink marker:hidden">
                    Writings
                  </summary>
                  <div className="space-y-5 border-l border-hairline bg-linen/25 py-4 pl-4">
                    <Link href="/blog" className="block py-2 text-sm font-bold text-accent" onClick={() => setOpen(false)}>
                      All Writings
                    </Link>
                    {groups.map((group) => (
                      <section key={group.slug}>
                        <h2 className="font-serif text-lg font-semibold text-ink">{group.label}</h2>
                        <ul className="mt-2 space-y-2">
                          {group.essays.map((essay) => (
                            <li key={essay.slug}>
                              <Link href={essay.href} className="block py-1 text-sm font-semibold leading-6 text-muted" onClick={() => setOpen(false)}>
                                {essay.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </details>
              </li>
              <li>
                <Link href="/achievements" className="block border-b border-hairline px-1 py-3 text-base font-bold text-ink" onClick={() => setOpen(false)}>
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/about" className="block border-b border-hairline px-1 py-3 text-base font-bold text-ink" onClick={() => setOpen(false)}>
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
