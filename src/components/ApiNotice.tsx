import { Container } from "@/components/Container";
import { cn } from "@/lib/utils";

export function ApiNotice({ className }: { className?: string }) {
  return (
    <Container className={className}>
      <div className="border border-hairline bg-linen p-6">
        <p className="font-serif text-2xl font-semibold text-ink">WordPress content is temporarily unavailable.</p>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
          The API did not respond as expected. Backend-managed content will appear here once the connection is restored.
        </p>
      </div>
    </Container>
  );
}

export function InlineNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border border-hairline bg-linen p-5 text-sm leading-6 text-muted", className)}>{children}</div>;
}
