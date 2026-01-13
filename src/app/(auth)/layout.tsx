import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-zinc-50 text-zinc-900">{children}</div>;
}


