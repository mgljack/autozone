"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { SectionTitle } from "@/components/common/SectionTitle";
import { useI18n } from "@/context/I18nContext";

export default function NoticePage() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6">
      <SectionTitle title={t("footer_notice")} subtitle={t("stub_subtitle")} />
      <EmptyState title={t("common_comingSoon")} description={t("stub_notice_desc")} />
    </div>
  );
}


