"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { LanguageSelect } from "@/components/common/LanguageSelect";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithIdPw, sendPhoneCode, loginWithPhoneOtp, loginWithSocial } = useAuth();
  const { t } = useI18n();
  const [tab, setTab] = React.useState<"idpw" | "phone">("idpw");

  const [id, setId] = React.useState("demo");
  const [pw, setPw] = React.useState("demo1234");

  const [phone, setPhone] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [otp, setOtp] = React.useState("");

  const [message, setMessage] = React.useState<{ type: "error" | "success"; text: string } | null>(null);
  const [returnUrl, setReturnUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const ru = sp.get("returnUrl");
    setReturnUrl(ru);
  }, []);

  const onIdPwLogin = () => {
    setMessage(null);
    const res = loginWithIdPw(id, pw);
    if (!res.ok) return setMessage({ type: "error", text: res.error });
    router.push(returnUrl || "/");
  };

  const onSendCode = () => {
    setMessage(null);
    const res = sendPhoneCode(phone);
    if (!res.ok) return setMessage({ type: "error", text: res.error });
    setCodeSent(true);
    setMessage({ type: "success", text: t("login_otpHint") });
  };

  const onPhoneLogin = () => {
    setMessage(null);
    const res = loginWithPhoneOtp(phone, otp);
    if (!res.ok) return setMessage({ type: "error", text: res.error });
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
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{t("login_title")}</h1>

            {/* Temporary Test Account Box */}
            {tab === "idpw" && (
              <div className="mb-6 rounded-xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-medium text-slate-700">{t("auth_tempAccount_title")}</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">{t("auth_tempAccount_id")}:</span>
                    <code className="rounded-md bg-white px-2 py-0.5 font-mono text-slate-900">demo</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">{t("auth_tempAccount_password")}:</span>
                    <code className="rounded-md bg-white px-2 py-0.5 font-mono text-slate-900">demo1234</code>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {message ? (
              <Alert variant={message.type === "error" ? "destructive" : "success"} className="mb-4">
                <AlertTitle>{message.type === "error" ? t("common_error") : t("common_success")}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            ) : null}

            {/* Form */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as "idpw" | "phone")}>
              <TabsList className="mb-4">
                <TabsTrigger value="idpw">{t("login_tab_idpw")}</TabsTrigger>
                <TabsTrigger value="phone">{t("login_tab_phone")}</TabsTrigger>
              </TabsList>

              <TabsContent value="idpw" className="grid gap-4">
                <Input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder={t("login_placeholder_id")}
                  className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
                />
                <Input
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder={t("login_placeholder_password")}
                  type="password"
                  className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
                />
                <Button variant="primary" onClick={onIdPwLogin} className="h-11 w-full rounded-xl">
                  {t("auth_login")}
                </Button>
              </TabsContent>

              <TabsContent value="phone" className="grid gap-4">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("login_placeholder_phone")}
                  className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
                />
                {!codeSent ? (
                  <Button variant="secondary" onClick={onSendCode} className="h-11 w-full rounded-xl">
                    {t("login_sendOtp")}
                  </Button>
                ) : (
                  <>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder={t("login_placeholder_otp")}
                      className="h-11 rounded-xl border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
                    />
                    <Button variant="primary" onClick={onPhoneLogin} className="h-11 w-full rounded-xl">
                      {t("login_verifyAndLogin")}
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Links */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
              <Link
                className="text-slate-600 hover:text-slate-900 hover:underline"
                href={returnUrl ? `/signup?returnUrl=${encodeURIComponent(returnUrl)}` : "/signup"}
              >
                {t("login_links_signup")}
              </Link>
              <div className="flex items-center gap-3">
                <Link className="text-slate-600 hover:text-slate-900 hover:underline" href="/find-id">
                  {t("login_links_findId")}
                </Link>
                <Link className="text-slate-600 hover:text-slate-900 hover:underline" href="/find-password">
                  {t("login_links_findPassword")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
