"use client";

import { Container } from "@/components/Container";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="py-20">
      <Container size="narrow">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Error</p>
        <h1 className="mt-4 font-serif text-5xl font-semibold text-ink">Something did not load correctly.</h1>
        <p className="mt-5 text-lg leading-8 text-muted">Please try again. If the issue persists, check the WordPress API and deployment logs.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-4 py-2 text-sm font-bold text-paper transition-colors hover:border-accent hover:bg-accent"
        >
          Try again
        </button>
      </Container>
    </section>
  );
}
