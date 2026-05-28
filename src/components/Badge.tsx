import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center border border-hairline bg-linen px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted", className)}>
      {children}
    </span>
  );
}
