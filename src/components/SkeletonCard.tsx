import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse border-t border-hairline pt-5", className)}>
      <div className="aspect-[16/10] bg-linen" />
      <div className="mt-5 h-3 w-24 bg-linen" />
      <div className="mt-4 h-7 w-11/12 bg-linen" />
      <div className="mt-3 h-7 w-8/12 bg-linen" />
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full bg-linen" />
        <div className="h-3 w-10/12 bg-linen" />
      </div>
    </div>
  );
}
