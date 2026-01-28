"use client";

import { SectionTitle } from "@/components/common/SectionTitle";
import { EmptyState } from "@/components/common/EmptyState";
import { useI18n } from "@/context/I18nContext";

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6">
      <SectionTitle title={t("footer_contact")} subtitle={t("stub_subtitle")} />
      <EmptyState title={t("common_comingSoon")} description={t("stub_contact_desc")} />
    </div>
  );
}


