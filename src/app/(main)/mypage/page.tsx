"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { MyPageLayout } from "./components/MyPageLayout";
import { ProfileCard } from "./components/ProfileCard";
import { QuickStats } from "./components/QuickStats";
import { SidebarNav } from "./components/SidebarNav";
import { MyListingsPage } from "./components/MyListingsPage";
import { FavoritesPage } from "./components/FavoritesPage";
import { RecentCarsPage } from "./components/RecentCarsPage";
import { ProfilePage } from "./components/ProfilePage";
import { NotificationsPage } from "./components/NotificationsPage";
import { WithdrawPage } from "./components/WithdrawPage";
import Link from "next/link";

export default function MyPage() {
  const { session } = useAuth();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "listings";

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8">
          <SectionTitle title={t("mypage.title")} subtitle={t("mypage.subtitle")} />
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="text-sm text-zinc-600">{t("mypage.notSignedIn")}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/login">
                  <Button>{t("mypage.goLogin")}</Button>
                </Link>
                <Link href="/buy/all">
                  <Button variant="outline">{t("mypage.browse")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const leftPanel = (
    <>
      <ProfileCard />
      <QuickStats />
      <SidebarNav />
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "favorites":
        return <FavoritesPage />;
      case "recent":
        return <RecentCarsPage />;
      case "listings":
        return <MyListingsPage />;
      case "notifications":
        return <NotificationsPage />;
      case "profile":
        return <ProfilePage />;
      case "withdraw":
        return <WithdrawPage />;
      default:
        return <MyListingsPage />;
    }
  };

  return (
    <MyPageLayout leftPanel={leftPanel}>
      {renderContent()}
    </MyPageLayout>
  );
}
