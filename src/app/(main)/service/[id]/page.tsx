"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { fetchCenterById } from "@/lib/mockApi";

export default function ServiceCenterDetailPage({ params }: { params: { id: string } }) {
  const { t } = useI18n();
  const centerQuery = useQuery({
    queryKey: ["centers", "detail", params.id],
    queryFn: () => fetchCenterById(params.id),
  });

  if (centerQuery.isLoading) return <div className="text-sm text-zinc-600">{t("common_loading")}</div>;
  if (!centerQuery.data) return <div className="text-sm text-zinc-600">{t("common_notFound")}</div>;

  const center = centerQuery.data;

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link className="font-normal text-zinc-900 hover:underline" href="/service">
          ← {t("service_backToCenters")}
        </Link>
      </div>

      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="relative h-64 w-full bg-zinc-100">
          <Image src={center.imageUrl} alt={center.name} fill className="object-cover" priority />
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <SectionTitle title={center.name} subtitle={center.regionLabel} />
              <div className="mt-3 text-sm text-zinc-600">
                <div>
                  <span className="font-normal text-zinc-900">{t("service_phoneLabel")}:</span> {center.phone}
                </div>
                <div className="mt-1">
                  <span className="font-normal text-zinc-900">{t("service_addressLabel")}:</span> {center.address}
                </div>
              </div>
            </div>

            <a href={`tel:${center.phone.replace(/\s/g, "")}`} className="shrink-0">
              <Button>{t("service_call")}</Button>
            </a>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {center.services.map((s) => (
              <span
                key={s}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-normal text-zinc-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-normal text-zinc-900">{t("service_mapTitle")}</div>
        <div className="mt-3 grid h-56 place-items-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-600">
          {t("service_mapPlaceholder")}
        </div>
      </div>
    </div>
  );
}


