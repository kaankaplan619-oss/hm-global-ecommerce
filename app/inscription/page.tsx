"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import GoogleAuthSection from "@/components/auth/GoogleAuthSection";
import { useT } from "@/components/i18n/I18nProvider";

export default function InscriptionPage() {
  const t = useT();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [type, setType] = useState<"particulier" | "entreprise">("particulier");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    company: "",
    siret: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type, marketingConsent }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? t("signup.error.create"));
        return;
      }

      const data = await res.json();
      if (!data.requiresEmailConfirmation && data.user) {
        setUser(data.user);
        router.push("/mon-compte");
        return;
      }
      setSuccessMessage(data.message ?? t("signup.success.default"));
    } catch {
      setError(t("signup.error.generic"));
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
                {t("signup.badge")}
              </span>
            </div>
            <h1 className="mb-3 text-3xl font-black text-[var(--hm-text)] md:text-4xl">
              {t("signup.intro.title")}
            </h1>
            <p className="max-w-md text-sm leading-7 text-[var(--hm-text-soft)]">
              {t("signup.intro.subtitle")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">{t("signup.feature1.title")}</p>
              <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
                {t("signup.feature1.body")}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">{t("signup.feature2.title")}</p>
              <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
                {t("signup.feature2.body")}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo/hm-global-logo.png"
                alt="HM Global Agence"
                width={220}
                height={60}
                className="h-11 w-auto"
                priority
              />
            </Link>
            <h2 className="mb-2 text-2xl font-black text-[var(--hm-text)]">{t("signup.form.title")}</h2>
            <p className="text-sm text-[var(--hm-text-soft)]">
              {t("signup.form.subtitle")}
            </p>
          </div>

          {successMessage ? (
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_40px_rgba(63,45,88,0.06)]">
              <div className="rounded-lg border border-[#86efac] bg-[#ecfdf5] p-3 text-sm text-[#166534]">
                {successMessage}
              </div>
              <p className="text-sm leading-relaxed text-[var(--hm-text-soft)]">
                {t("signup.success.note")}
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/connexion")}
                  className="btn-primary w-full"
                >
                  {t("signup.success.goToLogin")}
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  className="btn-outline w-full"
                >
                  {t("signup.success.edit")}
                </button>
              </div>
            </div>
          ) : (
            <>
            <GoogleAuthSection next="/mon-compte" />
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_40px_rgba(63,45,88,0.06)]"
            >
            {error && (
              <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                {error}
              </div>
            )}

            {/* Type selector */}
            <div>
              <label className="label">{t("signup.accountType.label")}</label>
              <div className="grid grid-cols-2 gap-2">
                {(["particulier", "entreprise"] as const).map((t2) => (
                  <button
                    key={t2}
                    type="button"
                    onClick={() => setType(t2)}
                    className={`rounded-lg border p-3 text-sm font-semibold transition-all capitalize
                      ${type === t2
                        ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-text)]"
                        : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/35"
                      }`}
                  >
                    {t2 === "particulier"
                      ? `👤 ${t("signup.accountType.individual")}`
                      : `🏢 ${t("signup.accountType.company")}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Entreprise fields */}
            {type === "entreprise" && (
              <>
                <div>
                  <label className="label">{t("signup.field.company")}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder={t("signup.field.companyPlaceholder")}
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">{t("signup.field.siret")}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="000 000 000 00000"
                    value={form.siret}
                    onChange={(e) => update("siret", e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Personal info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t("signup.field.firstName")}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={t("signup.field.firstNamePlaceholder")}
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">{t("signup.field.lastName")}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={t("signup.field.lastNamePlaceholder")}
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">{t("signup.field.email")}</label>
              <input
                type="email"
                className="input"
                placeholder={t("signup.field.emailPlaceholder")}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">{t("signup.field.phone")}</label>
              <input
                type="tel"
                className="input"
                placeholder="+33 6 12 34 56 78"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">{t("signup.field.password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hm-text-muted)] hover:text-[var(--hm-text-soft)]"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-[var(--hm-text-muted)]">{t("signup.field.passwordHint")}</p>
              <p className="mt-1 text-[10px] text-[var(--hm-text-muted)]">
                {t("signup.field.confirmHint")}
              </p>
            </div>

            {/* ── Consentement prospection (#88 — RGPD/CNIL), opt-in non pré-coché ── */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="marketing-consent"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--hm-primary)]"
              />
              <label
                htmlFor="marketing-consent"
                className="cursor-pointer text-[12.5px] leading-snug text-[var(--hm-text-soft)]"
              >
                {t("checkout.marketing_consent_before")}{" "}
                <Link href="/confidentialite" className="text-[var(--hm-primary)] hover:underline">
                  {t("checkout.privacy_policy_link")}
                </Link>{t("checkout.marketing_consent_after")}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full gap-2 mt-2"
            >
              {loading ? t("signup.submit.loading") : (
                <>
                  <UserPlus size={14} />
                  {t("signup.submit.label")}
                </>
              )}
            </button>
            </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-[var(--hm-text-soft)]">
            {t("signup.footer.haveAccount")}{" "}
            <Link href="/connexion" className="font-semibold text-[var(--hm-primary)] hover:underline">
              {t("signup.footer.login")}
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-[var(--hm-text-muted)]">
            {t("signup.footer.note")}
          </p>
        </div>
      </div>
    </div>
  );
}
