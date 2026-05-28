import { Container } from "@/components/Container";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function BlogLoading() {
  return (
    <section className="py-16">
      <Container>
        <div className="h-4 w-32 animate-pulse bg-linen" />
        <div className="mt-5 h-12 max-w-sm animate-pulse bg-linen" />
        <div className="mt-10 grid gap-9 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
