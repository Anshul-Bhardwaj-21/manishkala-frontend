import { Container } from "@/components/Container";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <section className="py-16">
      <Container>
        <div className="h-4 w-40 animate-pulse bg-linen" />
        <div className="mt-6 h-16 max-w-2xl animate-pulse bg-linen" />
        <div className="mt-4 h-16 max-w-xl animate-pulse bg-linen" />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </Container>
    </section>
  );
}
