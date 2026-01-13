"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { SectionTitle } from "@/components/common/SectionTitle";
import { useI18n } from "@/context/I18nContext";

export default function SupportPage() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6">
      <SectionTitle title={t("footer.support")} subtitle={t("stub.subtitle")} />
      <EmptyState title={t("common.comingSoon")} description={t("stub.support.desc")} />
    </div>
  );
}


