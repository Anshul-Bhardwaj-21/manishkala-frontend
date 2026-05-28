import { PostCard } from "@/components/PostCard";
import type { FrontendArticle } from "@/types/content";

export function RelatedPosts({ articles }: { articles: FrontendArticle[] }) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-hairline pt-8" aria-label="Related content">
      <div className="grid gap-8 md:grid-cols-3">
        {articles.map((article) => (
          <PostCard key={`${article.sourceType}:${article.id}`} article={article} />
        ))}
      </div>
    </section>
  );
}
