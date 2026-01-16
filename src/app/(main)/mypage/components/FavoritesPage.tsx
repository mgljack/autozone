"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/context/I18nContext";
import { useFavorites } from "@/features/favorites/favorites";
import { cars as mockCars, carTitle } from "@/mock/cars";
import { formatMnt } from "@/lib/format";
// Simple icon component
function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function FavoritesPage() {
  const { t } = useI18n();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const favoriteCars = React.useMemo(() => {
    return favoriteIds.map((id) => mockCars.find((c) => c.id === id)).filter(Boolean);
  }, [favoriteIds]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t("mypage.favorites.title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">{favoriteIds.length}개의 관심 차량</p>
      </div>

      {favoriteCars.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteCars.map((car) => {
            if (!car) return null;
            const title = carTitle(car);
            const thumbnailUrl = car.images?.[0] ?? "/samples/cars/car-01.svg";
            return (
              <Card key={car.id} className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
                <Link href={`/buy/all/${car.id}`}>
                  <div className="relative h-48 w-full bg-zinc-100">
                    <Image
                      src={thumbnailUrl}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link href={`/buy/all/${car.id}`} className="hover:underline">
                        <h3 className="truncate text-base font-semibold text-zinc-900">{title}</h3>
                      </Link>
                      <div className="mt-1 text-lg font-bold text-zinc-900">{formatMnt(car.priceMnt)}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(car.id);
                      }}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <HeartIcon className="h-5 w-5" filled />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-zinc-600">{t("home.left.none")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

