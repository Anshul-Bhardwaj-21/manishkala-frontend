import Link from "next/link";

import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <section className="py-20">
      <Container size="narrow">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">404</p>
        <h1 className="mt-4 font-serif text-5xl font-semibold text-ink">This page could not be found.</h1>
        <p className="mt-5 text-lg leading-8 text-muted">The essay may have moved, or the WordPress slug may not be published yet.</p>
        <Link
          href="/blog"
          className="mt-8 inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-4 py-2 text-sm font-bold text-paper transition-colors hover:border-accent hover:bg-accent"
        >
          Back to essays
        </Link>
      </Container>
    </section>
  );
}
