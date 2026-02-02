"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";

type ProfileImageUploaderProps = {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  userName?: string;
};

export function ProfileImageUploader({ value, onChange, userName }: ProfileImageUploaderProps) {
  const { t } = useI18n();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(t("mypage_profile_image_error_type"));
      e.target.value = "";
      return;
    }

    // Validate file size (3MB)
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      setError(t("mypage_profile_image_error_size"));
      e.target.value = "";
      return;
    }

    // Convert to dataURL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("profile.image", dataUrl);
        }
      }
    };
    reader.onerror = () => {
      setError(t("mypage_profile_image_error_read"));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("profile.image");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {/* Avatar Preview */}
      <div className="flex-shrink-0">
        <div className="relative h-24 w-24 sm:h-28 sm:w-28">
          {value ? (
            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Profile" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-zinc-200 bg-rose-600 text-2xl font-bold text-white">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            className="h-10 rounded-xl"
          >
            {t("mypage_profile_image_upload")}
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="h-10 rounded-xl text-zinc-600 hover:text-zinc-900"
            >
              {t("mypage_profile_image_remove")}
            </Button>
          )}
        </div>
        {error && (
          <div className="text-xs text-red-600">{error}</div>
        )}
        <p className="text-xs text-zinc-500">{t("mypage_profile_image_hint")}</p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label={t("mypage_profile_image_upload")}
      />
    </div>
  );
}

