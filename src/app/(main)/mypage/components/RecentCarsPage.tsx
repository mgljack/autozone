"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/context/I18nContext";
import { useRecentCars } from "@/features/recent/recent";
import { cars as mockCars, carTitle } from "@/mock/cars";
import { formatMnt } from "@/lib/format";

export function RecentCarsPage() {
  const { t } = useI18n();
  const { recent, clearRecent } = useRecentCars();

  const recentCars = React.useMemo(() => {
    return recent.map((r) => ({
      ...r,
      car: mockCars.find((c) => c.id === r.id),
    }));
  }, [recent]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t("mypage.recent.title")}</h1>
          <p className="mt-1 text-sm text-zinc-600">{recent.length}개의 최근 본 차량</p>
        </div>
        {recent.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("모든 최근 본 차량을 삭제하시겠습니까?")) {
                clearRecent();
              }
            }}
          >
            {t("common.clearAll")}
          </Button>
        )}
      </div>

      {recentCars.length > 0 ? (
        <div className="space-y-3">
          {recentCars.map((item) => {
            if (!item.car) return null;
            const title = carTitle(item.car);
            const thumbnailUrl = item.car.images?.[0] ?? "/samples/cars/car-01.svg";
            return (
              <Card key={item.id} className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
                <Link href={`/buy/all/${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        <Image
                          src={thumbnailUrl}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
                        <div className="mt-1 text-lg font-bold text-zinc-900">{formatMnt(item.car.priceMnt)}</div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {new Date(item.viewedAt).toLocaleString("ko-KR")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
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

