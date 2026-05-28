import type { ReactNode } from "react";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

interface HeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
  children?: ReactNode;
}

export function Hero({ eyebrow, title, description, primaryAction, secondaryAction, children }: HeroProps) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            {eyebrow ? <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p> : null}
            <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[1.02] text-ink md:text-7xl">{title}</h1>
            <p className="mt-7 max-w-2xl text-xl leading-9 text-muted">{description}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              {primaryAction ? <Button href={primaryAction.href}>{primaryAction.label}</Button> : null}
              {secondaryAction ? (
                <Button href={secondaryAction.href} variant="secondary">
                  {secondaryAction.label}
                </Button>
              ) : null}
            </div>
          </div>
          {children ? <div className="lg:pb-2">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
