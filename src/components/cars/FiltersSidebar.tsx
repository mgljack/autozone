"use client";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";

export function FiltersSidebar() {
  const { t } = useI18n();
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-sm font-normal">{t("filters.title")}</div>
      <div className="mt-3 grid gap-2">
        <Input placeholder={t("filters.searchPlaceholder")} />
        <Input placeholder={t("filters.locationPlaceholder")} />
      </div>
    </aside>
  );
}


