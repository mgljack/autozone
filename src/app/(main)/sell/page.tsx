"use client";

import Link from "next/link";
import React from "react";

import { RequireAuth } from "@/components/common/RequireAuth";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";

interface CategoryCard {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

export default function SellCategorySelectPage() {
  const { t } = useI18n();

  const cards: CategoryCard[] = [
    {
      href: "/sell/car",
      title: t("sell.category.car"),
      description: t("sell.goToForm"),
      icon: <CarIcon />,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      href: "/sell/motorcycle",
      title: t("sell.category.motorcycle"),
      description: t("sell.goToForm"),
      icon: <BikeIcon />,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      href: "/sell/tire",
      title: t("sell.category.tire"),
      description: t("sell.goToForm"),
      icon: <TireIcon />,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
    },
    {
      href: "/sell/parts",
      title: t("sell.category.parts"),
      description: t("sell.goToForm"),
      icon: <WrenchIcon />,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
    },
    {
      href: "/sell/rent",
      title: t("sell.carRental.title"),
      description: t("sell.carRental.register"),
      icon: <KeyIcon />,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50",
    },
    {
      href: "/sell/car-center",
      title: t("sell.carCenter.title"),
      description: t("sell.carCenter.description"),
      icon: <CarCenterIcon />,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
    },
  ];

  return (
    <RequireAuth returnUrl="/sell">
      <div className="grid gap-8 py-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-bold text-zinc-900">{t("sell.title")}</h1>
            <p className="mt-2 text-sm text-zinc-600">{t("sell.subtitle")}</p>
          </div>
          <Link href="/mypage?tab=listings">
            <Button variant="outline" size="sm" className="gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {t("sell.manageListings")}
            </Button>
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CategoryCard key={card.href} card={card} />
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}

function CategoryCard({ card }: { card: CategoryCard }) {
  return (
    <Link href={card.href}>
      <Card className="group relative h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md focus-within:ring-2 focus-within:ring-rose-500/20">
        <CardContent className="p-0">
          <div className="flex items-start gap-4">
            {/* Icon Badge */}
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", card.iconBg)}>
              <div className={cn("flex items-center justify-center", card.iconColor)}>
                {card.icon}
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-tight text-zinc-900">{card.title}</h3>
              <p className="mt-1.5 line-clamp-1 text-sm leading-5 text-zinc-500">{card.description}</p>
            </div>

            {/* Chevron */}
            <div className="shrink-0 self-center">
              <ChevronRightIcon className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-rose-600" />
      </div>
      </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Icon Components (Premium style, 18-20px)
function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 13.5V11a2 2 0 0 1 2-2h.8l1.3-3.2A2 2 0 0 1 9 4.5h6a2 2 0 0 1 1.9 1.3L18.2 9H19a2 2 0 0 1 2 2v2.5" />
      <path d="M5.5 13.5h13" />
      <path d="M7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

function BikeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h3" />
    </svg>
  );
}

function TireIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15L19 4" />
      <path d="M18 5l-1-1" />
      <path d="M15 8l-1-1" />
      <path d="M12 11l-1-1" />
    </svg>
  );
}

function CarCenterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v0" />
      <path d="M9 12v0" />
      <path d="M9 15v0" />
      <path d="M9 18v0" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
