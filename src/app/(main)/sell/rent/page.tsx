"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { RequireAuth } from "@/components/common/RequireAuth";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";

type RentDraft = {
  rentType: "small" | "large" | "truck" | "";
  manufacturer: string;
  model: string;
  yearMade: string;
  mileageKm: string;
  fuel: "gasoline" | "diesel" | "electric" | "hybrid" | "";
  transmission: "at" | "mt" | "";
  region: "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other" | "";
  pricePerDayMnt: string;
  availabilityDate: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

export default function RentRegistrationPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { session } = useAuth();

  const [draft, setDraft] = React.useState<RentDraft>(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("rentDraft") : null;
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return {
      rentType: "",
      manufacturer: "",
      model: "",
      yearMade: "",
      mileageKm: "",
      fuel: "",
      transmission: "",
      region: "",
      pricePerDayMnt: "",
      availabilityDate: "",
      description: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    };
  });

  const [memoCount, setMemoCount] = React.useState(draft.description.length);
  const [images, setImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!session) return;
    setDraft((prev) => {
      const next = { ...prev };
      if (!next.contactName) next.contactName = session.name ?? "";
      if (!next.contactEmail) next.contactEmail = session.email ?? "";
      if (!next.contactPhone) next.contactPhone = session.phone ?? "";
      return next;
    });
  }, [session]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rentDraft", JSON.stringify(draft));
    }
  }, [draft]);

  React.useEffect(() => {
    setMemoCount(draft.description.length);
  }, [draft.description]);

  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key: keyof RentDraft, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onPickImages: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif"]);
    const next = files.filter((f) => allowed.has(f.type));
    const merged = [...images, ...next].slice(0, 20);

    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    const previews = merged.map((f) => URL.createObjectURL(f));
    setImages(merged);
    setImagePreviews(previews);
  };

  const removeImageAt = (idx: number) => {
    const nextFiles = images.filter((_, i) => i !== idx);
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    const previews = nextFiles.map((f) => URL.createObjectURL(f));
    setImages(nextFiles);
    setImagePreviews(previews);
  };

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Reorder images and previews
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    const [draggedPreview] = newPreviews.splice(draggedIndex, 1);
    
    newImages.splice(dropIndex, 0, draggedImage);
    newPreviews.splice(dropIndex, 0, draggedPreview);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    setDraggedIndex(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (images.length < 1) next.images = t("sell_error_imagesRequired");
    if (draft.description.trim().length < 1) next.description = t("sell_error_memoRequired");
    if (draft.description.length > 10_000) next.description = t("sell_error_memoMaxLength");
    if (!draft.contactName.trim()) next.contactName = t("sell_error_nameRequired");
    if (!draft.contactEmail.trim()) next.contactEmail = t("sell_error_emailRequired");
    if (!draft.contactPhone.trim()) next.contactPhone = t("sell_error_phoneRequired");

    const require = (key: string, value: string) => {
      if (!value.trim()) next[key] = t("sell_error_required");
    };

    if (!draft.rentType) next.rentType = t("sell_error_rentTypeRequired");
    require("manufacturer", draft.manufacturer);
    require("model", draft.model);
    require("yearMade", draft.yearMade);
    require("mileageKm", draft.mileageKm);
    if (!draft.fuel) next.fuel = t("sell_error_fuelRequired");
    if (!draft.transmission) next.transmission = t("sell_error_transmissionRequired");
    if (!draft.region) next.region = t("sell_error_regionRequired");
    require("pricePerDayMnt", draft.pricePerDayMnt);
    require("availabilityDate", draft.availabilityDate);

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    
    // TODO: Save rent listing to backend/localStorage
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `rent_${Date.now()}`;
    
    // Save to localStorage for now
    const rentListings = JSON.parse(localStorage.getItem("rentListings") || "[]");
    rentListings.push({
      id,
      ...draft,
      images: images.map((f) => f.name),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("rentListings", JSON.stringify(rentListings));

    alert(t("sell_rental_registered"));
    router.push("/rent/small");
  };

  // Banner image for rental
  const bannerImage = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=600&fit=crop&auto=format";

  return (
    <RequireAuth returnUrl="/sell/rent">
      <div className="grid gap-6">
        {/* Premium Banner Section */}
        <section className="mb-2">
          <div className="relative h-32 overflow-hidden rounded-2xl border border-slate-200/70 sm:h-40">
            <Image
              src={bannerImage}
              alt={t("sell_rental_title")}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40" />
            <div className="relative z-10 flex h-full items-center p-6 sm:p-8">
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("sell_rental_title")}</h1>
                <p className="mt-2 text-sm text-slate-100 sm:text-base">
                  {t("sell_rental_subtitle")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell_common_basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>{t("sell_rental_rentType")}</Label>
                <Select value={draft.rentType} onChange={(e) => setField("rentType", e.target.value as any)}>
                  <option value="">{t("sell_common_select")}</option>
                  <option value="small">{t("sell_rental_rentType_small")}</option>
                  <option value="large">{t("sell_rental_rentType_large")}</option>
                  <option value="truck">{t("sell_rental_rentType_truck")}</option>
                </Select>
                {errors.rentType ? <div className="text-xs text-red-600">{errors.rentType}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_vehicle_manufacturer")}</Label>
                <Input
                  value={draft.manufacturer}
                  onChange={(e) => setField("manufacturer", e.target.value)}
                  placeholder={t("sell_vehicle_manufacturerPlaceholder")}
                />
                {errors.manufacturer ? <div className="text-xs text-red-600">{errors.manufacturer}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_vehicle_model")}</Label>
                <Input
                  value={draft.model}
                  onChange={(e) => setField("model", e.target.value)}
                  placeholder={t("sell_vehicle_modelPlaceholder")}
                />
                {errors.model ? <div className="text-xs text-red-600">{errors.model}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_vehicle_yearMade")}</Label>
                <Input
                  value={draft.yearMade}
                  onChange={(e) => setField("yearMade", e.target.value)}
                  placeholder={t("sell_rental_yearMadePlaceholder")}
                />
                {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_rental_mileageKm")}</Label>
                <Input
                  value={draft.mileageKm}
                  onChange={(e) => setField("mileageKm", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={t("sell_rental_mileageKmPlaceholder")}
                  inputMode="numeric"
                />
                {errors.mileageKm ? <div className="text-xs text-red-600">{errors.mileageKm}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_vehicle_fuel")}</Label>
                <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                  <option value="">{t("sell_common_select")}</option>
                  <option value="gasoline">{t("sell_rental_fuel_gasoline")}</option>
                  <option value="diesel">{t("sell_rental_fuel_diesel")}</option>
                  <option value="electric">{t("sell_rental_fuel_electric")}</option>
                  <option value="hybrid">{t("sell_rental_fuel_hybrid")}</option>
                </Select>
                {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_vehicle_transmission")}</Label>
                <Select value={draft.transmission} onChange={(e) => setField("transmission", e.target.value as any)}>
                  <option value="">{t("sell_common_select")}</option>
                  <option value="at">{t("sell_rental_transmission_at")}</option>
                  <option value="mt">{t("sell_rental_transmission_mt")}</option>
                </Select>
                {errors.transmission ? <div className="text-xs text-red-600">{errors.transmission}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_vehicle_region")}</Label>
                <Select value={draft.region} onChange={(e) => setField("region", e.target.value as any)}>
                  <option value="">{t("sell_common_select")}</option>
                  <option value="Ulaanbaatar">{t("sell_rental_region_ulaanbaatar")}</option>
                  <option value="Erdenet">{t("sell_rental_region_erdenet")}</option>
                  <option value="Darkhan">{t("sell_rental_region_darkhan")}</option>
                  <option value="Other">{t("sell_rental_region_other")}</option>
                </Select>
                {errors.region ? <div className="text-xs text-red-600">{errors.region}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_rental_pricePerDay")}</Label>
                <Input
                  value={draft.pricePerDayMnt}
                  onChange={(e) => setField("pricePerDayMnt", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={t("sell_rental_pricePerDayPlaceholder")}
                  inputMode="numeric"
                />
                {errors.pricePerDayMnt ? <div className="text-xs text-red-600">{errors.pricePerDayMnt}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell_rental_availabilityDate")}</Label>
                <Input
                  type="date"
                  value={draft.availabilityDate}
                  onChange={(e) => setField("availabilityDate", e.target.value)}
                />
                {errors.availabilityDate ? <div className="text-xs text-red-600">{errors.availabilityDate}</div> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell_common_photos")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("sell_common_imageUpload")}</Label>
              <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 transition-colors hover:border-rose-400 hover:bg-rose-50/30">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  multiple
                  onChange={onPickImages}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-rose-100 p-3">
                    <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-zinc-700 group-hover:text-rose-700">{t("sell_common_imageUpload")}</span>
                    <p className="mt-1 text-xs text-zinc-500">{t("sell_common_imageUploadHint")}</p>
                  </div>
                </div>
              </label>
              {errors.images ? <div className="text-xs text-red-600">{errors.images}</div> : null}
              {imagePreviews.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={`${src}-${idx}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className={`relative cursor-move overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all ${
                        draggedIndex === idx ? "opacity-50 scale-95" : "hover:border-zinc-300 hover:shadow-md"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`upload-${idx}`} className="h-20 w-full object-cover pointer-events-none" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImageAt(idx);
                        }}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-rose-50 hover:shadow-lg"
                        aria-label={t("sell_common_delete")}
                      >
                        <svg className="h-4 w-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell_rental_description")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Textarea
              value={draft.description}
              maxLength={10_000}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t("sell_rental_descriptionPlaceholder")}
            />
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <div>{errors.description ? <span className="text-red-600">{errors.description}</span> : null}</div>
              <div>
                {memoCount.toLocaleString()} / 10,000
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell_common_contact")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>{t("sell_contact_name")}</Label>
              <Input
                value={draft.contactName}
                onChange={(e) => setField("contactName", e.target.value)}
                placeholder={t("sell_contact_namePlaceholder")}
              />
              {errors.contactName ? <div className="text-xs text-red-600">{errors.contactName}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell_contact_email")}</Label>
              <Input
                value={draft.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value)}
                placeholder={t("sell_contact_emailPlaceholder")}
              />
              {errors.contactEmail ? <div className="text-xs text-red-600">{errors.contactEmail}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell_contact_phone")}</Label>
              <Input
                value={draft.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value)}
                placeholder={t("sell_contact_phonePlaceholder")}
              />
              {errors.contactPhone ? <div className="text-xs text-red-600">{errors.contactPhone}</div> : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href="/sell">
            <Button variant="outline">{t("common_back")}</Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const defaultDraft: RentDraft = {
                  rentType: "",
                  manufacturer: "",
                  model: "",
                  yearMade: "",
                  mileageKm: "",
                  fuel: "",
                  transmission: "",
                  region: "",
                  pricePerDayMnt: "",
                  availabilityDate: "",
                  description: "",
                  contactName: "",
                  contactEmail: "",
                  contactPhone: "",
                };
                setDraft(defaultDraft);
                setImages([]);
                imagePreviews.forEach((u) => URL.revokeObjectURL(u));
                setImagePreviews([]);
                setErrors({});
              }}
            >
              {t("sell_common_reset")}
            </Button>
            <Button variant="primary" onClick={onSubmit}>{t("sell_rental_register")}</Button>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          {t("sell_common_draftAutoSave")}: <span className="font-mono">rentDraft</span>
        </div>
      </div>
    </RequireAuth>
  );
}

