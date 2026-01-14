"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "peer h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-600/50 peer-focus:ring-offset-2",
            checked && "bg-rose-600",
            className,
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
              checked && "translate-x-5",
            )}
          />
        </div>
      </label>
    );
  },
);

Switch.displayName = "Switch";

