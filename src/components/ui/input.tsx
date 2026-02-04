import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-500 transition-all duration-200 hover:border-zinc-300 hover:ring-1 hover:ring-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-zinc-200 disabled:hover:ring-0",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";


