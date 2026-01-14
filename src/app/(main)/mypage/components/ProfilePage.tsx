"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

export function ProfilePage() {
  const { session, updateProfile } = useAuth();
  const { t } = useI18n();
  const [profileName, setProfileName] = React.useState("");
  const [profileEmail, setProfileEmail] = React.useState("");
  const [profilePhone, setProfilePhone] = React.useState("");
  const [profileMsg, setProfileMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!session) return;
    setProfileName(session.name ?? "");
    setProfileEmail(session.email ?? "");
    setProfilePhone(session.phone ?? "");
  }, [session]);

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t("mypage.profile.title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">계정 정보를 수정할 수 있습니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("mypage.profile.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileMsg && (
            <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">{profileMsg}</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("mypage.profile.name")}</Label>
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("mypage.profile.email")}</Label>
              <Input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("mypage.profile.phone")}</Label>
              <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => {
                setProfileMsg(null);
                const res = updateProfile({
                  name: profileName,
                  email: profileEmail || undefined,
                  phone: profilePhone || undefined,
                });
                if (!res.ok) return setProfileMsg(res.error);
                setProfileMsg(t("mypage.profile.saved"));
              }}
            >
              {t("mypage.profile.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

