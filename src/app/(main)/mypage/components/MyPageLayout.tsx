"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MyPageLayoutProps {
  leftPanel: React.ReactNode;
  children: React.ReactNode;
}

export function MyPageLayout({ leftPanel, children }: MyPageLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left Panel - Sticky on desktop */}
          <aside className="lg:sticky lg:top-8 lg:h-fit">
            {leftPanel}
          </aside>

          {/* Right Content Area */}
          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

