"use client";

import Link from "next/link";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { motorcycles, parts, tires } from "@/mock/cars";

export function BuyLandingClient({ type }: { type: string | null }) {
  const { t } = useI18n();

  const list =
    type === "motorcycle"
      ? motorcycles
      : type === "tire"
        ? tires
        : type === "parts"
          ? parts
          : null;

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("buy.title")} subtitle={t("buy.subtitle")} />

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm text-zinc-600">{t("buy.hoverHint")}</div>

        <div className="mt-4 inline-block">
          <div className="group relative">
            <Button>{t("home.card.buy")}</Button>
            <div className="invisible absolute left-0 top-full mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/buy/all">
                {t("nav.allVehicles")}
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/buy?type=motorcycle">
                {t("nav.motorcycle")}
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/buy?type=tire">
                {t("nav.tire")}
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/buy?type=parts">
                {t("nav.parts")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {list ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-normal">
            {type === "motorcycle"
              ? t("nav.motorcycle")
              : type === "tire"
                ? t("nav.tire")
                : t("nav.parts")}
          </div>
          <div className="mt-3 grid gap-2 text-sm text-zinc-700">
            {list.map((item) => (
              <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                <div className="font-normal">
                  {"manufacturer" in item
                    ? `${item.manufacturer} ${item.model}`
                    : "brand" in item
                      ? `${item.brand} ${item.size}`
                      : item.name}
                </div>
                <div className="mt-1 text-xs text-zinc-600">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


