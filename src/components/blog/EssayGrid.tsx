import { EssayCard } from "@/components/blog/EssayCard";
import type { FrontendArticle } from "@/types/content";

export function EssayGrid({ essays }: { essays: FrontendArticle[] }) {
  if (!essays.length) {
    return null;
  }

  return (
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {essays.map((essay, index) => (
        <EssayCard key={`${essay.sourceType}:${essay.id}`} essay={essay} priority={index < 3} />
      ))}
    </div>
  );
}
