"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { LanguageSelect } from "@/components/common/LanguageSelect";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

export default function SignupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { signupAndLogin } = useAuth();
  const [returnUrl, setReturnUrl] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [id, setId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [message, setMessage] = React.useState<{ type: "error" | "success"; text: string } | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const ru = sp.get("returnUrl");
    setReturnUrl(ru);
  }, []);

  const onSubmit = () => {
    setMessage(null);
    if (password !== confirm) return setMessage({ type: "error", text: t("signup_passwordMismatch") });
    const res = signupAndLogin({ name, email, phone, id, password });
    if (!res.ok) return setMessage({ type: "error", text: res.error });
    setMessage({ type: "success", text: t("signup_success") });
    router.push(returnUrl || "/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back to Home Link */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <Link className="text-sm text-slate-600 hover:text-slate-900 hover:underline" href="/">
          {t("common_backToHome")}
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left: Brand Panel */}
          <AuthBrandPanel />

          {/* Right: Form Panel */}
          <div className="relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
            {/* Language Switcher */}
            <div className="absolute right-6 top-6 sm:right-8 sm:top-8">
              <LanguageSelect />
            </div>

            {/* Title */}
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{t("signup_title")}</h1>
            <p className="mb-6 text-sm text-slate-600">{t("signup_subtitle")}</p>

            {/* Messages */}
            {message ? (
              <Alert variant={message.type === "error" ? "destructive" : "success"} className="mb-4">
                <AlertTitle>{message.type === "error" ? t("common_error") : t("common_success")}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            ) : null}

            {/* Form */}
            <div className="grid gap-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("signup_placeholder_name")}
                className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("signup_placeholder_email")}
                className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
              />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("signup_placeholder_phone")}
                className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
              />
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={t("signup_placeholder_id")}
                className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("signup_placeholder_password")}
                type="password"
                className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
              />
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t("signup_placeholder_confirm")}
                type="password"
                className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
              />

              <Button variant="primary" onClick={onSubmit} className="mt-2 h-11 w-full rounded-xl">
                {t("signup_createMock")}
              </Button>
            </div>

            {/* Sign in Link */}
            <div className="mt-6 text-sm text-slate-600">
              {t("signup_alreadyHave")}{" "}
              <Link className="font-medium text-slate-900 hover:underline" href="/login">
                {t("auth_login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
