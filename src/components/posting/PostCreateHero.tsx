"use client";

import React from "react";
import { useI18n } from "@/context/I18nContext";

interface PostCreateHeroProps {
  category: string;
}

export function PostCreateHero({ category }: PostCreateHeroProps) {
  const { t } = useI18n();

  const trustChips = [
    { label: t("sell_hero_trust_exposure") },
    { label: t("sell_hero_trust_inquiries") },
    { label: t("sell_hero_trust_mobile") },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 sm:p-10 lg:p-12">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
          {t("sell_formTitle")} {category}
        </h1>
        <p className="mt-3 text-base text-zinc-300 sm:text-lg">
          {t("sell_formSubtitle")}
        </p>

        {/* Trust chips */}
        <div className="mt-6 flex flex-wrap gap-3">
          {trustChips.map((chip, idx) => (
            <div
              key={idx}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
            >
              {chip.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

