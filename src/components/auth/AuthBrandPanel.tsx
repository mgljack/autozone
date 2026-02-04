"use client";

import { useI18n } from "@/context/I18nContext";

export function AuthBrandPanel() {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8 sm:p-10">
      <div className="flex h-full flex-col justify-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">AutoZone.mn</h1>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">
          {t("auth_brand_subtitle") || "몽골 자동차 통합 플랫폼"}
        </p>
        <ul className="mt-8 space-y-4">
          <li className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm text-slate-700 sm:text-base">{t("auth_brand_benefit1") || "빠른 검색"}</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-slate-700 sm:text-base">{t("auth_brand_benefit2") || "안전한 거래"}</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-sm text-slate-700 sm:text-base">{t("auth_brand_benefit3") || "원하는 차량 알림"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

