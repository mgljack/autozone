"use client";

import Link from "next/link";
import React from "react";

import { useI18n } from "@/context/I18nContext";

type SellerInfoProps = {
  sellerName: string;
  type: "vehicle" | "motorcycle" | "tire" | "parts";
};

export function SellerInfo({ sellerName, type }: SellerInfoProps) {
  const { t } = useI18n();

  // Determine the base route based on type
  const getBaseRoute = () => {
    switch (type) {
      case "vehicle":
        return "/buy/all";
      case "motorcycle":
        return "/buy/motorcycle";
      case "tire":
        return "/buy/tire";
      case "parts":
        return "/buy/parts";
      default:
        return "/buy/all";
    }
  };

  const baseRoute = getBaseRoute();
  const sellerId = encodeURIComponent(sellerName); // Use seller name as ID for prototype
  const href = `${baseRoute}?sellerId=${sellerId}`;

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <div className="text-sm text-zinc-600">
        {t("seller_label")}: <span className="font-medium text-zinc-900">{sellerName || t("seller_default")}</span>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 transition-colors hover:text-rose-700 hover:underline"
      >
        {t("seller_otherListings")}
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </div>
  );
}

