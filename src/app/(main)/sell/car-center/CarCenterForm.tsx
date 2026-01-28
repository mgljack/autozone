"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/context/I18nContext";
import { useDebounce } from "@/lib/useDebounce";
import { geocodeAddress, type GeocodeResult } from "@/lib/geocode";
import { readDraft, writeDraft, clearDraft, addCenter } from "@/features/carCenter/storage";
import type { CarCenterDraft } from "@/features/carCenter/types";
import { cn } from "@/lib/utils";

// Fix for default marker icons (only on client)
if (typeof window !== "undefined") {
  const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png";
  const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png";
  const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png";

  const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });

  L.Marker.prototype.options.icon = DefaultIcon;
}

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng], 15);
  }, [map, lat, lng]);
  return null;
}

function MapPreview({ lat, lng, centerName, address }: { lat: number; lng: number; centerName: string; address: string }) {
  const { t } = useI18n();
  if (!lat || !lng) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
        {t("carCenter_form_selectAddress")}
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        minZoom={10}
        maxZoom={18}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-sm">
              <div className="font-normal text-zinc-900">{centerName}</div>
              {address && <div className="mt-1 text-zinc-600">{address}</div>}
            </div>
          </Popup>
        </Marker>
        <MapUpdater lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}

export function CarCenterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = React.useState<CarCenterDraft>(() => {
    const saved = readDraft();
    return (
      saved || {
        name: "",
        description: "",
        category: "",
        services: [],
        phone1: "",
        phone2: "",
        hours: "",
        daysOff: "",
        emergency: false,
        address: "",
        addressDetail: "",
        region: "",
        lat: 47.9186, // Ulaanbaatar default
        lng: 106.9176,
        serviceItems: [],
        images: [],
      }
    );
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  
  // Payment state
  const [tier, setTier] = React.useState<"gold" | "silver" | "general">("general");
  const [durationDays, setDurationDays] = React.useState<number>(15);
  const [method, setMethod] = React.useState<"card" | "qpay">("card");
  const [paying, setPaying] = React.useState(false);
  const [paid, setPaid] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const paymentSectionRef = React.useRef<HTMLDivElement>(null);

  const debouncedAddress = useDebounce(draft.address, 500);

  const geocodeQuery = useQuery({
    queryKey: ["geocode", debouncedAddress],
    queryFn: () => geocodeAddress(debouncedAddress),
    enabled: debouncedAddress.length >= 6,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedGeocodeResult, setSelectedGeocodeResult] = React.useState<GeocodeResult | null>(null);

  React.useEffect(() => {
    writeDraft(draft);
  }, [draft]);

  React.useEffect(() => {
    if (selectedGeocodeResult) {
      setDraft((prev) => ({
        ...prev,
        lat: parseFloat(selectedGeocodeResult.lat),
        lng: parseFloat(selectedGeocodeResult.lon),
        address: selectedGeocodeResult.display_name,
      }));
    } else if (geocodeQuery.data && geocodeQuery.data.length === 1) {
      const result = geocodeQuery.data[0];
      setDraft((prev) => ({
        ...prev,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      }));
    }
  }, [selectedGeocodeResult, geocodeQuery.data]);

  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const setField = (key: keyof CarCenterDraft, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onPickImages: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif"]);
    const next = files.filter((f) => allowed.has(f.type));
    const merged = [...imageFiles, ...next].slice(0, 10);
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    const previews = merged.map((f) => URL.createObjectURL(f));
    setImageFiles(merged);
    setImagePreviews(previews);
    setField("images", merged.map((f) => f.name));
  };

  const removeImageAt = (idx: number) => {
    const nextFiles = imageFiles.filter((_, i) => i !== idx);
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    const previews = nextFiles.map((f) => URL.createObjectURL(f));
    setImageFiles(nextFiles);
    setImagePreviews(previews);
    setField("images", nextFiles.map((f) => f.name));
  };

  const addServiceItem = () => {
    setDraft((prev) => ({
      ...prev,
      serviceItems: [...prev.serviceItems, { name: "", priceMnt: "", duration: "" }],
    }));
  };

  const removeServiceItem = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.filter((_, i) => i !== idx),
    }));
  };

  const updateServiceItem = (idx: number, field: "name" | "priceMnt" | "duration", value: string) => {
    setDraft((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = t("carCenter_form_error_nameRequired");
    if (!draft.phone1.trim()) next.phone1 = t("carCenter_form_error_phone1Required");
    if (!draft.hours.trim()) next.hours = t("carCenter_form_error_hoursRequired");
    if (!draft.address.trim()) next.address = t("carCenter_form_error_addressRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const plans = [
    { tier: "gold" as const, label: "Gold", options: [{ days: 5, priceMnt: 8000 }, { days: 10, priceMnt: 20000 }] },
    { tier: "silver" as const, label: "Silver", options: [{ days: 7, priceMnt: 3000 }, { days: 14, priceMnt: 6000 }] },
    { tier: "general" as const, label: "General", options: [{ days: 15, priceMnt: 0 }] },
  ];

  const selectedPlan = plans.find((p) => p.tier === tier)!;
  const selectedOption = selectedPlan.options.find((o) => o.days === durationDays) ?? selectedPlan.options[0]!;
  const amountMnt = selectedOption.priceMnt;

  React.useEffect(() => {
    // keep duration valid when tier changes
    const first = plans.find((p) => p.tier === tier)!.options[0]!;
    setDurationDays((prev) => {
      const ok = plans.find((p) => p.tier === tier)!.options.some((o) => o.days === prev);
      return ok ? prev : first.days;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  const onSubmit = async () => {
    if (!validate()) return;
    
    // Scroll to payment section if tier not selected, otherwise open payment dialog
    if (paymentSectionRef.current) {
      paymentSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Small delay to allow scroll, then open dialog
    setTimeout(() => {
      setPaymentDialogOpen(true);
    }, 300);
  };

  const onPay = async () => {
    setPaying(true);
    try {
      // simulate payment delay
      await new Promise((r) => setTimeout(r, 450));

      const now = new Date();
      const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `center_${Date.now()}`;
      const center = {
        id,
        name: draft.name,
        description: draft.description,
        category: draft.category || "other",
        services: draft.services,
        phone1: draft.phone1,
        phone2: draft.phone2 || undefined,
        hours: draft.hours,
        daysOff: draft.daysOff || "",
        emergency: draft.emergency,
        address: draft.address,
        addressDetail: draft.addressDetail,
        region: draft.region || "Ulaanbaatar",
        lat: draft.lat,
        lng: draft.lng,
        serviceItems: draft.serviceItems.map((item) => ({
          name: item.name,
          priceMnt: Number(item.priceMnt) || 0,
          duration: item.duration || undefined,
        })),
        images: imagePreviews,
        createdAt: new Date().toISOString(),
        // Payment metadata
        planType: tier,
        planDays: durationDays,
        priceAmount: amountMnt,
        paidMethod: method,
        postedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      };
      addCenter(center);
      clearDraft();
      // Invalidate centers query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["centers", "list"] });
      setPaid(true);
    } finally {
      setPaying(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false);
    alert(t("carCenter_form_registerSuccess") || t("carCenter_form_success"));
    router.push("/service");
  };

  const geocodeResults = geocodeQuery.data || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Form */}
      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("carCenter_form_basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("carCenter_form_name")}</Label>
              <Input
                value={draft.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder={t("carCenter_form_namePlaceholder")}
              />
              {errors.name ? <div className="text-xs text-red-600">{errors.name}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("carCenter_form_description")}</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder={t("carCenter_form_descriptionPlaceholder")}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("carCenter_form_category")}</Label>
              <Select value={draft.category} onChange={(e) => setField("category", e.target.value)}>
                <option value="">{t("sell_common_select")}</option>
                <option value="engine">{t("carCenter_form_category_engine")}</option>
                <option value="brake">{t("carCenter_form_category_brake")}</option>
                <option value="tire">{t("carCenter_form_category_tire")}</option>
                <option value="oil">{t("carCenter_form_category_oil")}</option>
                <option value="electric">{t("carCenter_form_category_electric")}</option>
                <option value="body">{t("carCenter_form_category_body")}</option>
                <option value="other">{t("carCenter_form_category_other")}</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t("carCenter_form_services")}</Label>
              <Input
                value={draft.services.join(", ")}
                onChange={(e) => setField("services", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder={t("carCenter_form_servicesPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact/Operating */}
        <Card>
          <CardHeader>
            <CardTitle>{t("carCenter_form_contact")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("carCenter_form_phone1")}</Label>
              <Input
                value={draft.phone1}
                onChange={(e) => setField("phone1", e.target.value)}
                placeholder={t("carCenter_form_phone1Placeholder")}
              />
              {errors.phone1 ? <div className="text-xs text-red-600">{errors.phone1}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("carCenter_form_phone2")}</Label>
              <Input
                value={draft.phone2}
                onChange={(e) => setField("phone2", e.target.value)}
                placeholder={t("carCenter_form_phone2Placeholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("carCenter_form_hours")}</Label>
              <Input
                value={draft.hours}
                onChange={(e) => setField("hours", e.target.value)}
                placeholder={t("carCenter_form_hoursPlaceholder")}
              />
              {errors.hours ? <div className="text-xs text-red-600">{errors.hours}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("carCenter_form_daysOff")}</Label>
              <Select value={draft.daysOff} onChange={(e) => setField("daysOff", e.target.value)}>
                <option value="">{t("sell_common_select")}</option>
                <option value="everyday">{t("carCenter_form_daysOff_everyday")}</option>
                <option value="weekend">{t("carCenter_form_daysOff_weekend")}</option>
                <option value="weekday">{t("carCenter_form_daysOff_weekday")}</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={draft.emergency}
                onCheckedChange={(checked) => setField("emergency", checked === true)}
              />
              <Label>{t("carCenter_form_emergency")}</Label>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>{t("carCenter_form_location")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("carCenter_form_address")}</Label>
              <Input
                value={draft.address}
                onChange={(e) => {
                  setField("address", e.target.value);
                  setSelectedGeocodeResult(null);
                }}
                placeholder={t("carCenter_form_addressPlaceholder")}
              />
              {errors.address ? <div className="text-xs text-red-600">{errors.address}</div> : null}
              {geocodeQuery.isLoading && <div className="text-xs text-zinc-500">{t("common_loading")}</div>}
              {geocodeResults.length > 1 && (
                <div className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                  <div className="text-xs font-medium text-zinc-700">{t("carCenter_form_searchResults")}</div>
                  {geocodeResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => setSelectedGeocodeResult(result)}
                      className="text-left rounded px-2 py-1.5 text-xs text-zinc-700 hover:bg-white"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
              {geocodeQuery.data && geocodeQuery.data.length === 0 && debouncedAddress.length >= 6 && (
                <div className="text-xs text-zinc-500">{t("carCenter_form_selectAddress")}</div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>{t("carCenter_form_addressDetail")}</Label>
              <Input
                value={draft.addressDetail}
                onChange={(e) => setField("addressDetail", e.target.value)}
                placeholder={t("carCenter_form_addressDetailPlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("carCenter_form_region")}</Label>
              <Select value={draft.region} onChange={(e) => setField("region", e.target.value)}>
                <option value="">{t("sell_common_select")}</option>
                <option value="Ulaanbaatar">Ulaanbaatar</option>
                <option value="Erdenet">Erdenet</option>
                <option value="Darkhan">Darkhan</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services/Prices */}
        <Card>
          <CardHeader>
            <CardTitle>{t("carCenter_form_serviceItems")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {draft.serviceItems.map((item, idx) => (
              <div key={idx} className="grid gap-2 rounded-lg border border-zinc-200 p-3 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label className="text-xs">{t("carCenter_form_serviceName")}</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateServiceItem(idx, "name", e.target.value)}
                    placeholder={t("carCenter_form_serviceName")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">{t("carCenter_form_servicePrice")}</Label>
                  <Input
                    value={item.priceMnt}
                    onChange={(e) => updateServiceItem(idx, "priceMnt", e.target.value)}
                    placeholder="0"
                    type="number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">{t("carCenter_form_serviceDuration")}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={item.duration || ""}
                      onChange={(e) => updateServiceItem(idx, "duration", e.target.value)}
                      placeholder="30분"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeServiceItem(idx)}
                      className="shrink-0"
                    >
                      {t("carCenter_form_removeService")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addServiceItem}>
              {t("carCenter_form_addService")}
            </Button>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>{t("carCenter_form_photos")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("sell_common_imageUpload")} ({t("carCenter_form_photosMax")})</Label>
              <Input type="file" accept=".jpg,.jpeg,.png,.gif" multiple onChange={onPickImages} />
              {imagePreviews.length > 0 && (
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
                        {t("sell_common_delete")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <div ref={paymentSectionRef}>
          <Card>
            <CardHeader>
              <CardTitle>{t("payment_plan_title")}</CardTitle>
            </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {plans.map((p) => {
                const active = p.tier === tier;
                return (
                  <button
                    key={p.tier}
                    type="button"
                    onClick={() => setTier(p.tier)}
                    className={`rounded-2xl border p-4 text-left ${
                      active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <div className="text-base font-normal">{p.label}</div>
                    <div className={`mt-1 text-sm ${active ? "text-white/80" : "text-zinc-600"}`}>
                      {p.tier === "general" ? t("payment_plan_freePlan") : t("payment_plan_featuredPlan")}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-2">
              <Label>{t("payment_plan_duration")}</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedPlan.options.map((o) => (
                  <label
                    key={`${tier}-${o.days}`}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                      durationDays === o.days ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="duration"
                        checked={durationDays === o.days}
                        onChange={() => setDurationDays(o.days)}
                      />
                      <div className="font-normal">{o.days} {t("payment_plan_days")}</div>
                    </div>
                    <div className="font-normal">{o.priceMnt.toLocaleString("mn-MN")} MNT</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm text-zinc-600">
                {t("payment_plan_selectedInfo")}: <span className="font-normal text-zinc-900">{tier.toUpperCase()}</span> ·{" "}
                <span className="font-normal text-zinc-900">{durationDays} {t("payment_plan_days")}</span>
              </div>
              <div className="text-base font-extrabold">{amountMnt.toLocaleString("mn-MN")} MNT</div>
            </div>
          </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/sell")}>
            {t("common_back")}
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? t("carCenter_form_submitting") : t("carCenter_form_submit")}
          </Button>
        </div>
      </div>

      {/* Right: Map Preview */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <Card>
          <CardHeader>
            <CardTitle>{t("carCenter_form_mapPreview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <MapPreview lat={draft.lat} lng={draft.lng} centerName={draft.name || "카센터"} address={draft.address} />
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("payment_method_title")}</DialogTitle>
          </DialogHeader>
          {paid ? (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <span dangerouslySetInnerHTML={{ __html: t("payment_success_completed") }} />
              </div>
              <div className="grid gap-2 text-sm text-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="text-zinc-500">{t("payment_success_tier")}</div>
                  <div className="font-normal">{tier.toUpperCase()}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-zinc-500">{t("payment_success_duration")}</div>
                  <div className="font-normal">{durationDays} {t("payment_plan_days")}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-zinc-500">{t("payment_success_amount")}</div>
                  <div className="font-normal">{amountMnt.toLocaleString("mn-MN")} MNT</div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handlePaymentSuccess}>
                  {t("payment_success_close")}
                </Button>
                <Button onClick={handlePaymentSuccess}>
                  {t("payment_success_viewListing")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="text-sm text-zinc-600">
                <span dangerouslySetInnerHTML={{ __html: t("payment_method_description") }} />
              </div>

              <div className="grid gap-2">
                <Label>{t("payment_method_choose")}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${method === "card" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}>
                    <input type="radio" name="method" checked={method === "card"} onChange={() => setMethod("card")} />
                    <div className="font-normal">{t("payment_method_card")}</div>
                  </label>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${method === "qpay" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}>
                    <input type="radio" name="method" checked={method === "qpay"} onChange={() => setMethod("qpay")} />
                    <div className="font-normal">{t("payment_method_qpay")}</div>
                  </label>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{t("payment_method_amount")}</Label>
                <Input readOnly value={`${amountMnt.toLocaleString("mn-MN")} MNT`} />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={paying}>
                  {t("common_cancel")}
                </Button>
                <Button onClick={onPay} disabled={paying}>
                  {paying ? t("payment_method_paying") : t("payment_method_pay")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

