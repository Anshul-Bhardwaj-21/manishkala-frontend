import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends Omit<ComponentProps<typeof Link>, "href" | "className"> {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "border-ink bg-ink text-paper shadow-[0_10px_28px_rgba(35,33,29,0.12)] hover:bg-accent hover:border-accent",
  secondary: "border-hairline bg-linen/45 text-ink hover:border-accent hover:text-accent",
  ghost: "border-transparent bg-transparent text-ink underline hover:text-accent"
};

export function Button({ href, children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm font-bold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
