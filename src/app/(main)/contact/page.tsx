"use client";

import { SectionTitle } from "@/components/common/SectionTitle";
import { EmptyState } from "@/components/common/EmptyState";
import { useI18n } from "@/context/I18nContext";

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6">
      <SectionTitle title={t("footer.contact")} subtitle={t("stub.subtitle")} />
      <EmptyState title={t("common.comingSoon")} description={t("stub.contact.desc")} />
    </div>
  );
}


