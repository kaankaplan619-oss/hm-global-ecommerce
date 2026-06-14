"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useT } from "@/components/i18n/I18nProvider";

function getSiteUrl() {
  return (
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    ""
  );
}

export default function ForgotPasswordPage() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${getSiteUrl()}/auth/callback?type=recovery&next=/reinitialiser-mot-de-passe`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        console.error("[ForgotPassword] resetPasswordForEmail failed:", resetError.message);
        setError(t("forgotPassword.errorSend"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("forgotPassword.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(247,250,252,0.92)_0%,rgba(255,255,255,1)_100%)] px-4 pt-28 pb-16">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="rounded-[2rem] border border-[var(--hm-line)] bg-white p-8 shadow-[0_20px_48px_rgba(63,45,88,0.06)] md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--hm-primary)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-primary)]">
                {t("forgotPassword.badge")}
              </span>
            </div>
            <h1 className="mb-3 text-3xl font-black text-[var(--hm-text)] md:text-4xl">
              {t("forgotPassword.title")}
            </h1>
            <p className="max-w-md text-sm leading-7 text-[var(--hm-text-soft)]">
              {t("forgotPassword.intro")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">{t("forgotPassword.feature1Title")}</p>
              <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
                {t("forgotPassword.feature1Desc")}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">{t("forgotPassword.feature2Title")}</p>
              <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
                {t("forgotPassword.feature2Desc")}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center">
          <div className="mb-8 text-center">
            <Link href="/" className="mb-6 inline-block">
              <Image
                src="/logo/hm-global-logo.png"
                alt="HM Global Agence"
                width={220}
                height={60}
                className="h-11 w-auto"
                priority
              />
            </Link>
            <h2 className="mb-2 text-2xl font-black text-[var(--hm-text)]">{t("forgotPassword.formTitle")}</h2>
            <p className="text-sm text-[var(--hm-text-soft)]">
              {t("forgotPassword.formSubtitle")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_40px_rgba(63,45,88,0.06)]"
          >
            {error && (
              <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-[1rem] border border-[#86efac] bg-[#ecfdf5] p-4 text-sm text-[#166534]">
                {t("forgotPassword.success")}
              </div>
            )}

            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)]">
                <ShieldCheck size={14} className="text-[var(--hm-primary)]" />
                {t("forgotPassword.securityLabel")}
              </div>
              <p className="text-xs leading-6 text-[var(--hm-text-soft)]">
                {t("forgotPassword.securityDesc")}
              </p>
            </div>

            <div>
              <label className="label">{t("forgotPassword.emailLabel")}</label>
              <input
                type="email"
                className="input"
                placeholder={t("forgotPassword.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full gap-2">
              {loading ? (
                t("forgotPassword.submitLoading")
              ) : (
                <>
                  <Mail size={14} />
                  {t("forgotPassword.submit")}
                </>
              )}
            </button>

            <Link
              href="/connexion"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[var(--hm-text-soft)] transition hover:text-[var(--hm-primary)]"
            >
              <ArrowLeft size={14} />
              {t("forgotPassword.backToLogin")}
            </Link>
          </form>

          <p className="mt-5 text-center text-xs leading-6 text-[var(--hm-text-muted)]">
            {t("forgotPassword.spamNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
