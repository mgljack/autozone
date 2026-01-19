"use client";

import Link from "next/link";
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

  const validate = () => {
    const next: Record<string, string> = {};

    if (images.length < 1) next.images = t("sell.error.imagesRequired");
    if (draft.description.trim().length < 1) next.description = t("sell.error.memoRequired");
    if (draft.description.length > 10_000) next.description = t("sell.error.memoMaxLength");
    if (!draft.contactName.trim()) next.contactName = t("sell.error.nameRequired");
    if (!draft.contactEmail.trim()) next.contactEmail = t("sell.error.emailRequired");
    if (!draft.contactPhone.trim()) next.contactPhone = t("sell.error.phoneRequired");

    const require = (key: string, value: string) => {
      if (!value.trim()) next[key] = t("sell.error.required");
    };

    if (!draft.rentType) next.rentType = t("sell.error.rentTypeRequired");
    require("manufacturer", draft.manufacturer);
    require("model", draft.model);
    require("yearMade", draft.yearMade);
    require("mileageKm", draft.mileageKm);
    if (!draft.fuel) next.fuel = t("sell.error.fuelRequired");
    if (!draft.transmission) next.transmission = t("sell.error.transmissionRequired");
    if (!draft.region) next.region = t("sell.error.regionRequired");
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

    alert(t("sell.rental.registered"));
    router.push("/rent/small");
  };

  return (
    <RequireAuth returnUrl="/sell/rent">
      <div className="grid gap-6">
        <SectionTitle title={t("sell.rental.title")} subtitle={t("sell.rental.subtitle")} />

        <Card>
          <CardHeader>
            <CardTitle>{t("sell.common.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>{t("sell.rental.rentType")}</Label>
                <Select value={draft.rentType} onChange={(e) => setField("rentType", e.target.value as any)}>
                  <option value="">{t("sell.common.select")}</option>
                  <option value="small">{t("sell.rental.rentType.small")}</option>
                  <option value="large">{t("sell.rental.rentType.large")}</option>
                  <option value="truck">{t("sell.rental.rentType.truck")}</option>
                </Select>
                {errors.rentType ? <div className="text-xs text-red-600">{errors.rentType}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.vehicle.manufacturer")}</Label>
                <Input
                  value={draft.manufacturer}
                  onChange={(e) => setField("manufacturer", e.target.value)}
                  placeholder={t("sell.vehicle.manufacturerPlaceholder")}
                />
                {errors.manufacturer ? <div className="text-xs text-red-600">{errors.manufacturer}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.vehicle.model")}</Label>
                <Input
                  value={draft.model}
                  onChange={(e) => setField("model", e.target.value)}
                  placeholder={t("sell.vehicle.modelPlaceholder")}
                />
                {errors.model ? <div className="text-xs text-red-600">{errors.model}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.vehicle.yearMade")}</Label>
                <Input
                  value={draft.yearMade}
                  onChange={(e) => setField("yearMade", e.target.value)}
                  placeholder={t("sell.rental.yearMadePlaceholder")}
                />
                {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.rental.mileageKm")}</Label>
                <Input
                  value={draft.mileageKm}
                  onChange={(e) => setField("mileageKm", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={t("sell.rental.mileageKmPlaceholder")}
                  inputMode="numeric"
                />
                {errors.mileageKm ? <div className="text-xs text-red-600">{errors.mileageKm}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.vehicle.fuel")}</Label>
                <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                  <option value="">{t("sell.common.select")}</option>
                  <option value="gasoline">{t("sell.rental.fuel.gasoline")}</option>
                  <option value="diesel">{t("sell.rental.fuel.diesel")}</option>
                  <option value="electric">{t("sell.rental.fuel.electric")}</option>
                  <option value="hybrid">{t("sell.rental.fuel.hybrid")}</option>
                </Select>
                {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.vehicle.transmission")}</Label>
                <Select value={draft.transmission} onChange={(e) => setField("transmission", e.target.value as any)}>
                  <option value="">{t("sell.common.select")}</option>
                  <option value="at">{t("sell.rental.transmission.at")}</option>
                  <option value="mt">{t("sell.rental.transmission.mt")}</option>
                </Select>
                {errors.transmission ? <div className="text-xs text-red-600">{errors.transmission}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.vehicle.region")}</Label>
                <Select value={draft.region} onChange={(e) => setField("region", e.target.value as any)}>
                  <option value="">{t("sell.common.select")}</option>
                  <option value="Ulaanbaatar">{t("sell.rental.region.ulaanbaatar")}</option>
                  <option value="Erdenet">{t("sell.rental.region.erdenet")}</option>
                  <option value="Darkhan">{t("sell.rental.region.darkhan")}</option>
                  <option value="Other">{t("sell.rental.region.other")}</option>
                </Select>
                {errors.region ? <div className="text-xs text-red-600">{errors.region}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.rental.pricePerDay")}</Label>
                <Input
                  value={draft.pricePerDayMnt}
                  onChange={(e) => setField("pricePerDayMnt", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={t("sell.rental.pricePerDayPlaceholder")}
                  inputMode="numeric"
                />
                {errors.pricePerDayMnt ? <div className="text-xs text-red-600">{errors.pricePerDayMnt}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>{t("sell.rental.availabilityDate")}</Label>
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
            <CardTitle>{t("sell.common.photos")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("sell.common.imageUpload")}</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                multiple
                onChange={onPickImages}
              />
              {errors.images ? <div className="text-xs text-red-600">{errors.images}</div> : null}
              {imagePreviews.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {imagePreviews.map((src, idx) => (
                    <div key={src} className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`upload-${idx}`} className="h-20 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white"
                      >
                        {t("sell.common.delete")}
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
            <CardTitle>{t("sell.rental.description")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Textarea
              value={draft.description}
              maxLength={10_000}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t("sell.rental.descriptionPlaceholder")}
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
            <CardTitle>{t("sell.common.contact")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>{t("sell.contact.name")}</Label>
              <Input
                value={draft.contactName}
                onChange={(e) => setField("contactName", e.target.value)}
                placeholder={t("sell.contact.namePlaceholder")}
              />
              {errors.contactName ? <div className="text-xs text-red-600">{errors.contactName}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell.contact.email")}</Label>
              <Input
                value={draft.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value)}
                placeholder={t("sell.contact.emailPlaceholder")}
              />
              {errors.contactEmail ? <div className="text-xs text-red-600">{errors.contactEmail}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell.contact.phone")}</Label>
              <Input
                value={draft.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value)}
                placeholder={t("sell.contact.phonePlaceholder")}
              />
              {errors.contactPhone ? <div className="text-xs text-red-600">{errors.contactPhone}</div> : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href="/sell">
            <Button variant="outline">{t("common.back")}</Button>
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
              {t("sell.common.reset")}
            </Button>
            <Button variant="primary" onClick={onSubmit}>{t("sell.rental.register")}</Button>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          {t("sell.common.draftAutoSave")}: <span className="font-mono">rentDraft</span>
        </div>
      </div>
    </RequireAuth>
  );
}

