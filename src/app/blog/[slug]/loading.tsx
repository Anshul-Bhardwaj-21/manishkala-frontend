import { Container } from "@/components/Container";

export default function ArticleLoading() {
  return (
    <article className="py-16">
      <Container size="narrow">
        <div className="h-5 w-28 animate-pulse bg-linen" />
        <div className="mt-6 h-16 animate-pulse bg-linen" />
        <div className="mt-3 h-16 w-10/12 animate-pulse bg-linen" />
        <div className="mt-6 h-5 w-72 animate-pulse bg-linen" />
      </Container>
      <Container className="mt-10" size="wide">
        <div className="aspect-[16/9] animate-pulse bg-linen" />
      </Container>
      <Container className="mt-12" size="narrow">
        <div className="space-y-4">
          <div className="h-4 animate-pulse bg-linen" />
          <div className="h-4 animate-pulse bg-linen" />
          <div className="h-4 w-10/12 animate-pulse bg-linen" />
          <div className="h-4 w-11/12 animate-pulse bg-linen" />
        </div>
      </Container>
    </article>
  );
}
