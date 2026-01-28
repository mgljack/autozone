import React from "react";

import { Footer } from "@/components/layout/Footer";
import { FloatingMenu } from "@/components/layout/FloatingMenu";
import { Header } from "@/components/layout/Header";
import { LeftFloatingMenu } from "@/components/layout/LeftFloatingMenu";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-white text-zinc-900">
      <Header />
      <main className="mx-auto w-full max-w-[1280px] px-3 py-6 sm:px-4 lg:px-5">{children}</main>
      <Footer />
      <FloatingMenu />
      <LeftFloatingMenu />
    </div>
  );
}


