import { Container } from "@/components/Container";
import { EssayGrid } from "@/components/blog/EssayGrid";
import type { FrontendArticle } from "@/types/content";

export function AchievementHighlights({ items }: { items: FrontendArticle[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="py-14">
      <Container>
        <div className="mb-8 border-t border-hairline pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">DRDO</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ink">Achievements</h2>
        </div>
        <EssayGrid essays={items} />
      </Container>
    </section>
  );
}
