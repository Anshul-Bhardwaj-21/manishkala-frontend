import { EssayCard } from "@/components/blog/EssayCard";
import type { FrontendArticle } from "@/types/content";

export function RelatedPosts({ articles }: { articles: FrontendArticle[] }) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-hairline pt-8" aria-label="Related content">
      <div className="mb-8 flex items-center gap-4">
        <h2 className="font-serif text-3xl font-semibold text-ink">Related Writings</h2>
        <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
      </div>
      <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
        {articles.map((article) => (
          <EssayCard key={`${article.sourceType}:${article.id}`} essay={article} />
        ))}
      </div>
    </section>
  );
}
