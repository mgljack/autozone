"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useI18n } from "@/context/I18nContext";
import { useFavorites } from "@/features/favorites/favorites";
import { useRecentCars } from "@/features/recent/recent";
import { formatMnt } from "@/lib/format";
import type { Car } from "@/mock/cars";
import { carTitle, cars as allCars } from "@/mock/cars";

export function LeftFloatingMenu() {
  const { t } = useI18n();
  const { recent, clearRecent } = useRecentCars();
  const { favoriteIds } = useFavorites();
  const [panel, setPanel] = React.useState<"recent" | "favorites" | null>(null);
  const [showTop, setShowTop] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const read = () => {
      if (typeof window === "undefined") return 0;
      const raw = window.localStorage.getItem("unreadCount");
      const n = raw ? Number(raw) : 0;
      return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    };
    setUnreadCount(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "unreadCount") setUnreadCount(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const recentCars = recent
    .map((r) => allCars.find((c) => c.id === r.id))
    .filter(Boolean) as Car[];
  const favoriteCars = favoriteIds.map((id) => allCars.find((c) => c.id === id)).filter(Boolean) as Car[];

  const items = panel === "recent" ? recentCars : panel === "favorites" ? favoriteCars : [];

  return (
    <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 md:block">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
        <div className="grid w-20">
          <button
            type="button"
            className="group relative grid place-items-center gap-1 px-2 py-3 text-center hover:bg-zinc-50"
            onClick={() => setPanel((p) => (p === "recent" ? null : "recent"))}
          >
            <CarIcon className="h-6 w-6 text-zinc-700 transition-colors group-hover:text-zinc-900" />
            <div className="text-[11px] font-normal text-zinc-700">{t("home.left.recent")}</div>
          </button>
          <div className="mx-3 h-px bg-zinc-100" />
          <button
            type="button"
            className="group relative grid place-items-center gap-1 px-2 py-3 text-center hover:bg-zinc-50"
            onClick={() => setPanel((p) => (p === "favorites" ? null : "favorites"))}
          >
            <div className="relative">
              <HeartIcon className="h-6 w-6 text-zinc-700 transition-colors group-hover:text-zinc-900" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold leading-none text-white">
                  {Math.min(unreadCount, 99)}
                </span>
              ) : null}
            </div>
            <div className="text-[11px] font-normal text-zinc-700">{t("home.left.favorites")}</div>
          </button>
          {showTop ? (
            <>
              <div className="mx-3 h-px bg-zinc-100" />
              <button
                type="button"
                className="group grid place-items-center gap-1 px-2 py-3 text-center hover:bg-zinc-50"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <TopIcon className="h-6 w-6 text-zinc-700 transition-colors group-hover:text-zinc-900" />
                <div className="text-[11px] font-normal text-zinc-700">{t("home.left.top")}</div>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {panel ? (
        <div className="absolute right-full top-1/2 mr-3 w-80 -translate-y-1/2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div className="text-sm font-normal text-zinc-900">
              {panel === "recent" ? t("home.left.recent") : t("home.left.favorites")}
            </div>
            {panel === "recent" ? (
              <button
                type="button"
                className="text-xs font-normal text-zinc-700 hover:underline"
                onClick={clearRecent}
              >
                {t("home.left.clear")}
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-auto p-2">
            {items.length ? (
              <div className="grid gap-2">
                {items.slice(0, 10).map((c) => (
                  <Link
                    key={c.id}
                    href={`/buy/all/${c.id}`}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50"
                  >
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-zinc-100">
                      <Image src={c.images?.[0] ?? "/samples/cars/car-01.svg"} alt="" fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-normal">{carTitle(c)}</div>
                      <div className="text-xs text-zinc-600">{formatMnt(c.priceMnt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-zinc-600">{t("home.left.none")}</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 13.5V11a2 2 0 0 1 2-2h.8l1.3-3.2A2 2 0 0 1 9 4.5h6a2 2 0 0 1 1.9 1.3L18.2 9H19a2 2 0 0 1 2 2v2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 13.5h13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 4l6 6M12 4 6 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4v16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

