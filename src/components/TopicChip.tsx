import { cn } from "@/lib/utils";

interface TopicChipProps {
  label: string;
  className?: string;
}

export function TopicChip({ label, className }: TopicChipProps) {
  return (
    <span className={cn("inline-flex items-center border border-hairline bg-linen/45 px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-accent", className)}>
      {label}
    </span>
  );
}
