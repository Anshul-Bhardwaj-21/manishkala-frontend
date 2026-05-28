import { cn } from "@/lib/utils";

interface TopicChipProps {
  label: string;
  className?: string;
}

export function TopicChip({ label, className }: TopicChipProps) {
  return (
    <span className={cn("inline-flex items-center border border-hairline bg-paper px-3 py-1 text-sm font-semibold text-muted", className)}>
      {label}
    </span>
  );
}
