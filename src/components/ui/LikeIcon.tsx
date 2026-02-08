"use client";

import React from "react";
import { cn } from "@/lib/utils";

type LikeIconProps = {
  liked: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function LikeIcon({ liked, size = "sm", className }: LikeIconProps) {
  const sizeClasses = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <svg
      viewBox="0 0 24 24"
      fill={liked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "transition-all duration-150",
        sizeClasses,
        liked ? "text-white" : "text-white",
        className
      )}
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

