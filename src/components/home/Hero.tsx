import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

interface HomeHeroProps {
  title?: string;
  subtitle?: string;
}

export function HomeHero({ title, subtitle }: HomeHeroProps) {
  const initials = title
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <section className="border-b border-hairline py-20 md:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(260px,0.38fr)] lg:items-end">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-accent" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Writings and Reflections</p>
            </div>
            {title ? <h1 className="mt-6 text-balance font-serif text-6xl font-semibold leading-[0.96] text-ink md:text-8xl">{title}</h1> : null}
            {subtitle ? <p className="mt-8 max-w-2xl text-xl leading-9 text-muted md:text-2xl md:leading-10">{subtitle}</p> : null}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/blog">Read writings</Button>
              <Button href="/about" variant="secondary">
                About
              </Button>
            </div>
          </div>

          {initials ? (
            <div className="hidden border-l border-hairline pl-8 lg:block" aria-hidden="true">
              <div className="flex aspect-[4/5] max-h-[360px] items-center justify-center border border-hairline bg-linen/55">
                <span className="font-serif text-8xl font-semibold leading-none text-accent/85">{initials}</span>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
