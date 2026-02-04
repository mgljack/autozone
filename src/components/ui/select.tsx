import * as React from "react";

import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-all duration-200 hover:border-zinc-300 hover:ring-1 hover:ring-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 disabled:opacity-60 disabled:hover:border-zinc-200 disabled:hover:ring-0",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}


