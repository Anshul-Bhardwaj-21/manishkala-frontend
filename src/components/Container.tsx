import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "narrow" | "default" | "wide";
}

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl"
};

export function Container({ children, className, size = "default" }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", sizes[size], className)}>{children}</div>;
}
