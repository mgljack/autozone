"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
// Simple icon component
function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function WithdrawPage() {
  const { t } = useI18n();
  const { deleteAccount } = useAuth();
  const router = useRouter();
  const [confirmed, setConfirmed] = React.useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t("mypage.withdraw")}</h1>
        <p className="mt-1 text-sm text-zinc-600">계정을 영구적으로 삭제합니다.</p>
      </div>

      <Card className="border-rose-200 bg-rose-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-900">
            <AlertTriangleIcon className="h-5 w-5" />
            {t("mypage.withdraw.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-zinc-700">{t("mypage.withdraw.body")}</div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confirm-withdraw"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-600"
            />
            <label htmlFor="confirm-withdraw" className="text-sm text-zinc-700">
              위 내용을 확인했으며, 계정 삭제에 동의합니다.
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/mypage?tab=listings")}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={!confirmed}
              onClick={() => {
                deleteAccount();
                router.push("/");
              }}
            >
              {t("mypage.withdraw.confirm")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

