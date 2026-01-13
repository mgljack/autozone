"use client";

import Link from "next/link";

import { useI18n } from "@/context/I18nContext";

export function FloatingMenu() {
  const { t } = useI18n();

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white/90 p-2 shadow-lg backdrop-blur sm:hidden">
      <nav className="grid grid-cols-5 gap-2 text-center text-xs font-normal text-zinc-700">
        <Link className="rounded-xl px-2 py-2 hover:bg-zinc-100" href="/buy">
          {t("nav.buy")}
        </Link>
        <Link className="rounded-xl px-2 py-2 hover:bg-zinc-100" href="/rent">
          {t("nav.rent")}
        </Link>
        <Link className="rounded-xl px-2 py-2 hover:bg-zinc-100" href="/service">
          {t("nav.service")}
        </Link>
        <Link className="rounded-xl px-2 py-2 hover:bg-zinc-100" href="/sell">
          {t("nav.sell")}
        </Link>
        <Link className="rounded-xl px-2 py-2 hover:bg-zinc-100" href="/mypage">
          {t("nav.mypage")}
        </Link>
      </nav>
    </div>
  );
}


