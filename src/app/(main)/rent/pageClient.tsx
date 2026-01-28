"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/context/I18nContext";
import { formatMnt } from "@/lib/format";
import { fetchRentItems } from "@/lib/mockApi";
import type { RentItem, RentType } from "@/mock/rent";

function normalizeType(type: string | null): RentType {
  if (type === "large") return "large";
  if (type === "truck") return "truck";
  return "small";
}

export function RentClient({ type }: { type: string | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const activeType = normalizeType(type);
  const [selected, setSelected] = React.useState<RentItem | null>(null);

  const listQuery = useQuery({
    queryKey: ["rent", "list", activeType],
    queryFn: () => fetchRentItems(activeType),
  });

  const setType = (next: RentType) => {
    router.replace(`/rent?type=${next}`, { scroll: false });
  };

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("rent_title")} subtitle={t("app_prototype")} />

      <Tabs value={activeType} onValueChange={(v) => setType(v as RentType)}>
        <TabsList className="max-w-md">
          <TabsTrigger value="small">{t("rent_small")}</TabsTrigger>
          <TabsTrigger value="large">{t("rent_large")}</TabsTrigger>
          <TabsTrigger value="truck">{t("rent_truck")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeType} className="p-0 border-0 bg-transparent">
          {listQuery.isLoading ? (
            <div className="text-sm text-zinc-600">{t("common_loading")}</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(listQuery.data ?? []).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left hover:bg-zinc-50"
                >
                  <div className="relative h-40 w-full bg-zinc-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="truncate text-base font-normal">{item.title}</div>
                    <div className="mt-1 text-sm text-zinc-600">{item.region}</div>
                    <div className="mt-3 text-base font-extrabold">{formatMnt(item.pricePerDayMnt)} / day</div>
                    <div className="mt-3">
                      <Button variant="outline">문의하기</Button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(open) => (!open ? setSelected(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>렌트 문의</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="grid gap-3 text-sm">
              <div className="font-normal">{selected.title}</div>
              <div className="text-zinc-600">{selected.region}</div>
              <div className="rounded-xl border border-zinc-200 bg-white p-3">
                <div className="font-normal">{selected.contactName}</div>
                <div className="mt-1 text-zinc-700">{selected.contactPhone}</div>
              </div>
              <a href={`tel:${selected.contactPhone.replace(/\s/g, "")}`}>
                <Button className="w-full">전화하기</Button>
              </a>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}


