import { Container } from "@/components/Container";

export default function AboutLoading() {
  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1fr]">
          <div>
            <div className="h-4 w-24 animate-pulse bg-linen" />
            <div className="mt-5 h-16 max-w-md animate-pulse bg-linen" />
            <div className="mt-6 h-24 max-w-xl animate-pulse bg-linen" />
          </div>
          <div className="aspect-[4/5] animate-pulse bg-linen" />
        </div>
      </Container>
    </section>
  );
}
