import { Container } from "@/components/Container";
import { EssayGrid } from "@/components/blog/EssayGrid";
import type { FrontendArticle } from "@/types/content";

export function RecentEssays({ essays }: { essays: FrontendArticle[] }) {
  if (!essays.length) {
    return null;
  }

  return (
    <section className="py-14">
      <Container>
        <div className="mb-8 border-t border-hairline pt-8">
          <h2 className="font-serif text-4xl font-semibold leading-tight text-ink">Recent Writings</h2>
        </div>
        <EssayGrid essays={essays} />
      </Container>
    </section>
  );
}
