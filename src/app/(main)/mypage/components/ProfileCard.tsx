"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useRouter } from "next/navigation";

export function ProfileCard() {
  const { session, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  if (!session) return null;

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 text-2xl font-bold text-white">
            {initials}
          </div>

          {/* User Info */}
          <div className="w-full">
            <div className="text-lg font-semibold text-zinc-900">{session.name}</div>
            {session.email && (
              <div className="mt-1 text-sm text-zinc-600">{session.email}</div>
            )}
            {session.phone && (
              <div className="mt-0.5 text-sm text-zinc-600">{session.phone}</div>
            )}
          </div>

          {/* Actions */}
          <div className="w-full space-y-2">
            <Button variant="primary" className="w-full" onClick={() => router.push("/mypage?tab=profile")}>
              {t("mypage.profile.title")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              {t("mypage.logout")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

