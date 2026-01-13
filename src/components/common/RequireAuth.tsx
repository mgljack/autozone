"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useAuth } from "@/context/AuthContext";

export function RequireAuth({
  returnUrl,
  children,
}: {
  returnUrl: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session } = useAuth();

  React.useEffect(() => {
    if (session) return;
    router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }, [session, router, returnUrl]);

  if (!session) return null;
  return <>{children}</>;
}


