"use client";

import React from "react";
import dynamicImport from "next/dynamic";
import { RequireAuth } from "@/components/common/RequireAuth";
import { SectionTitle } from "@/components/common/SectionTitle";
import { useI18n } from "@/context/I18nContext";

// Force dynamic rendering to avoid SSR/prerendering issues with Leaflet and localStorage
export const dynamic = "force-dynamic";

// Dynamically import CarCenterForm to avoid SSR issues with Leaflet
const CarCenterForm = dynamicImport(() => import("./CarCenterForm").then((mod) => ({ default: mod.CarCenterForm })), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-sm text-zinc-500">Loading...</div>
    </div>
  ),
});

export default function CarCenterRegistrationPage() {
  const { t } = useI18n();
  return (
    <RequireAuth returnUrl="/sell/car-center">
      <div className="grid gap-6">
        <SectionTitle title={t("carCenter_form_title")} subtitle={t("carCenter_form_subtitle")} />
        <CarCenterForm />
      </div>
    </RequireAuth>
  );
}

