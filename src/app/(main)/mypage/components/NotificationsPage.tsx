"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/context/I18nContext";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

export function NotificationsPage() {
  const { t } = useI18n();
  const [notif, setNotif] = React.useState(() =>
    readLocalStorage<{ marketing: boolean; email: boolean; push: boolean }>("turbo.notifications", {
      marketing: true,
      email: true,
      push: true,
    }),
  );

  const saveNotif = (next: { marketing: boolean; email: boolean; push: boolean }) => {
    setNotif(next);
    writeLocalStorage("turbo.notifications", next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t("mypage.notifications.title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">알림 설정을 관리할 수 있습니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("mypage.notifications.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4">
            <div>
              <div className="font-medium text-zinc-900">{t("mypage.notifications.marketing")}</div>
              <div className="mt-0.5 text-xs text-zinc-600">프로모션 및 마케팅 정보를 받습니다</div>
            </div>
            <Switch
              checked={notif.marketing}
              onCheckedChange={(checked) => saveNotif({ ...notif, marketing: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4">
            <div>
              <div className="font-medium text-zinc-900">{t("mypage.notifications.email")}</div>
              <div className="mt-0.5 text-xs text-zinc-600">이메일 알림을 받습니다</div>
            </div>
            <Switch
              checked={notif.email}
              onCheckedChange={(checked) => saveNotif({ ...notif, email: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4">
            <div>
              <div className="font-medium text-zinc-900">{t("mypage.notifications.push")}</div>
              <div className="mt-0.5 text-xs text-zinc-600">푸시 알림을 받습니다</div>
            </div>
            <Switch
              checked={notif.push}
              onCheckedChange={(checked) => saveNotif({ ...notif, push: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

