"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import type { SellDraft } from "@/features/sell/types";
import { formatMnt } from "@/lib/format";

interface PostCreateSummaryCardProps {
  draft: SellDraft;
  imagesCount: number;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function PostCreateSummaryCard({ draft, imagesCount, onSubmit, isSubmitting = false }: PostCreateSummaryCardProps) {
  const { t } = useI18n();

  const hasData = (value: string | undefined | null) => value && value.trim().length > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <h3 className="text-base font-semibold text-zinc-900">{t("sell_summary_title")}</h3>
      
      <div className="mt-4 grid gap-3">
        {/* Manufacturer */}
        {(draft.category === "car" || draft.category === "motorcycle") && (
          <>
            <div className="grid gap-1.5">
              <div className="text-xs font-medium text-zinc-500">{t("sell_vehicle_manufacturer")}</div>
              <div className="text-sm font-normal text-zinc-900">
                {hasData(draft.manufacturer) ? draft.manufacturer : (
                  <span className="text-zinc-400">{t("sell_summary_empty")}</span>
                )}
              </div>
            </div>
            <div className="grid gap-1.5">
              <div className="text-xs font-medium text-zinc-500">{t("sell_vehicle_model")}</div>
              <div className="text-sm font-normal text-zinc-900">
                {hasData(draft.model) ? draft.model : (
                  <span className="text-zinc-400">{t("sell_summary_empty")}</span>
                )}
              </div>
            </div>
          </>
        )}

        {draft.category === "parts" && (
          <div className="grid gap-1.5">
            <div className="text-xs font-medium text-zinc-500">{t("sell_summary_title")}</div>
            <div className="text-sm font-normal text-zinc-900">
              {hasData(draft.title) ? draft.title : (
                <span className="text-zinc-400">{t("sell_summary_empty")}</span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        {(draft as any).priceMnt && (
          <div className="grid gap-1.5">
            <div className="text-xs font-medium text-zinc-500">{t("sell_summary_price")}</div>
            <div className="text-base font-bold text-zinc-900">
              {formatMnt(Number((draft as any).priceMnt))}
            </div>
          </div>
        )}

        {/* Images */}
        <div className="grid gap-1.5">
          <div className="text-xs font-medium text-zinc-500">{t("sell_summary_images")}</div>
          <div className="text-sm font-normal text-zinc-900">
            {imagesCount > 0 ? `${imagesCount} ${t("sell_summary_imagesCount")}` : (
              <span className="text-zinc-400">{t("sell_summary_empty")}</span>
            )}
          </div>
        </div>

        {/* Contact */}
        {hasData(draft.contactPhone) && (
          <div className="grid gap-1.5">
            <div className="text-xs font-medium text-zinc-500">{t("sell_summary_contact")}</div>
            <div className="text-sm font-normal text-zinc-900">{draft.contactPhone}</div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="mt-6">
        <Button
          variant="primary"
          className="w-full"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("common_loading") : t("sell_form_continueToPayment")}
        </Button>
      </div>
    </div>
  );
}

