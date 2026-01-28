"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/features/favorites/favorites";
import { useRecentCars } from "@/features/recent/recent";
import { readMyListings } from "@/features/sell/storage";
import { useI18n } from "@/context/I18nContext";

export function QuickStats() {
  const { t } = useI18n();
  const { favoriteIds } = useFavorites();
  const { recent } = useRecentCars();
  const listings = React.useMemo(() => readMyListings(), []);

  const stats = [
    {
      label: t("mypage_favorites_title"),
      value: favoriteIds.length,
      color: "text-rose-600",
    },
    {
      label: t("mypage_recent_title"),
      value: recent.length,
      color: "text-blue-600",
    },
    {
      label: t("mypage_myListings_title"),
      value: listings.length,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      {stats.map((stat, idx) => (
        <Card key={idx} className="border-zinc-200">
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="mt-1 text-xs font-normal text-zinc-600">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

