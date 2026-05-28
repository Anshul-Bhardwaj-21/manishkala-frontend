import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-5 border-t border-hairline pt-8 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p> : null}
        <h2 className="font-serif text-3xl font-semibold leading-tight text-ink md:text-4xl">{title}</h2>
        {description ? <p className="mt-3 max-w-xl text-base leading-7 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
