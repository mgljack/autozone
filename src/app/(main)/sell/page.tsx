"use client";

import Link from "next/link";
import React from "react";

import { RequireAuth } from "@/components/common/RequireAuth";
import { SectionTitle } from "@/components/common/SectionTitle";
import { useI18n } from "@/context/I18nContext";

type CardTone = "blue" | "green" | "purple" | "orange";

interface CategoryCard {
  href: string;
  title: string;
  description: string;
  tone: CardTone;
  icon: React.ReactNode;
}

export default function SellCategorySelectPage() {
  const { t } = useI18n();

  const cards: CategoryCard[] = [
    {
      href: "/sell/car",
      title: t("sell.category.car"),
      description: t("sell.goToForm"),
      tone: "blue",
      icon: <CarIcon />,
    },
    {
      href: "/sell/motorcycle",
      title: t("sell.category.motorcycle"),
      description: t("sell.goToForm"),
      tone: "green",
      icon: <BikeIcon />,
    },
    {
      href: "/sell/tire",
      title: t("sell.category.tire"),
      description: t("sell.goToForm"),
      tone: "purple",
      icon: <TireIcon />,
    },
    {
      href: "/sell/parts",
      title: t("sell.category.parts"),
      description: t("sell.goToForm"),
      tone: "orange",
      icon: <WrenchIcon />,
    },
    {
      href: "/sell/rent",
      title: t("sell.carRental.title"),
      description: t("sell.carRental.register"),
      tone: "blue",
      icon: <KeyIcon />,
    },
  ];

  return (
    <RequireAuth returnUrl="/sell">
      <div className="grid gap-6">
        <SectionTitle title={t("sell.title")} subtitle={t("sell.subtitle")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <CategoryCard key={card.href} card={card} />
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}

function CategoryCard({ card }: { card: CategoryCard }) {
  const toneStyles = {
    blue: {
      border: "border-blue-200/60",
      borderHover: "group-hover:border-blue-300",
      gradient: "from-blue-50/90 via-blue-50/50 to-white",
      iconBg: "from-blue-500 to-blue-600",
    },
    green: {
      border: "border-emerald-200/60",
      borderHover: "group-hover:border-emerald-300",
      gradient: "from-emerald-50/90 via-emerald-50/50 to-white",
      iconBg: "from-emerald-500 to-emerald-600",
    },
    purple: {
      border: "border-purple-200/60",
      borderHover: "group-hover:border-purple-300",
      gradient: "from-purple-50/90 via-purple-50/50 to-white",
      iconBg: "from-purple-500 to-purple-600",
    },
    orange: {
      border: "border-orange-200/60",
      borderHover: "group-hover:border-orange-300",
      gradient: "from-orange-50/90 via-orange-50/50 to-white",
      iconBg: "from-orange-500 to-orange-600",
    },
  };

  const style = toneStyles[card.tone];

  return (
    <Link
      href={card.href}
      className={`group relative min-h-[180px] overflow-hidden rounded-[20px] border bg-gradient-to-br p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:min-h-[200px] sm:p-6 ${style.border} ${style.borderHover} ${style.gradient}`}
    >
      <div
        className={`absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br shadow-sm sm:h-16 sm:w-16 ${style.iconBg}`}
      >
        <div className="text-white">{card.icon}</div>
      </div>
      <div className="mt-16 sm:mt-20">
        <div className="text-lg font-semibold leading-tight text-zinc-900 sm:text-xl">{card.title}</div>
        <div className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-600 sm:mt-4">{card.description}</div>
      </div>
    </Link>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13.5V11a2 2 0 0 1 2-2h.8l1.3-3.2A2 2 0 0 1 9 4.5h6a2 2 0 0 1 1.9 1.3L18.2 9H19a2 2 0 0 1 2 2v2.5" />
      <path d="M5.5 13.5h13" />
      <path d="M7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

function BikeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h3" />
    </svg>
  );
}

function TireIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15L19 4" />
      <path d="M18 5l-1-1" />
      <path d="M15 8l-1-1" />
      <path d="M12 11l-1-1" />
    </svg>
  );
}


