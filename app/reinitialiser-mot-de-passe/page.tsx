"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Check, Circle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useT } from "@/components/i18n/I18nProvider";

export default function ResetPasswordPage() {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let resolved = false;

    // Subscribe to auth state changes — catches PASSWORD_RECOVERY event
    // fired by Supabase JS SDK when it reads the #hash tokens (implicit flow).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasRecoverySession(true);
        setCheckingSession(false);
        resolved = true;
      }
    });

    // Also check existing session (PKCE flow: cookie already set by callback route)
    supabase.auth.getSession().then(({ data }) => {
      if (resolved) return;
      setHasRecoverySession(!!data.session);
      setCheckingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Force du mot de passe en direct (5 critères → faible / moyen / fort).
  const strength = useMemo<{ pct: number; level: "" | "weak" | "medium" | "strong" }>(() => {
    const pw = password;
    if (!pw) return { pct: 0, level: "" };
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const level = s <= 2 ? "weak" : s <= 3 ? "medium" : "strong";
    const pct = Math.max(10, Math.min(100, (s / 5) * 100));
    return { pct, level };
  }, [password]);

  const strengthColor =
    strength.level === "strong" ? "#16a34a" : strength.level === "medium" ? "#f59e0b" : "#ef4444";
  const strengthText =
    strength.level === "strong"
      ? t("resetPassword.strengthStrong")
      : strength.level === "medium"
        ? t("resetPassword.strengthMedium")
        : t("resetPassword.strengthWeak");

  const requirements = [
    { ok: password.length >= 8, label: t("resetPassword.reqMinLength") },
    { ok: confirmPassword.length > 0 && password === confirmPassword, label: t("resetPassword.reqMatch") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("resetPassword.errorMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.errorMismatch"));
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(t("resetPassword.errorInvalidLink"));
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/connexion?reset=success");
      }, 1500);
    } catch {
      setError(t("resetPassword.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(247,250,252,0.92)_0%,rgba(255,255,255,1)_100%)] px-4 pt-28 pb-16">
      <div className="mx-auto w-full max-w-md">
        <div className="hm-card-enter mb-8 text-center" style={{ animationDelay: "0.04s" }}>
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
          <h1 className="mb-2 text-2xl font-black text-[var(--hm-text)]">{t("resetPassword.title")}</h1>
          <p className="text-sm text-[var(--hm-text-soft)]">
            {t("resetPassword.subtitle")}
          </p>
        </div>

        <div
          className="hm-card-enter rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_40px_rgba(63,45,88,0.06)]"
          style={{ animationDelay: "0.14s" }}
        >
          {checkingSession ? (
            <p className="text-sm text-[var(--hm-text-soft)]">{t("resetPassword.checkingLink")}</p>
          ) : !hasRecoverySession ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                {t("resetPassword.linkInvalid")}
              </div>
              <Link href="/mot-de-passe-oublie" className="btn-outline w-full text-center">
                {t("resetPassword.requestNewLink")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-[#86efac] bg-[#ecfdf5] p-3 text-sm text-[#166534]">
                  {t("resetPassword.success")}
                </div>
              )}

              <div>
                <label className="label">{t("resetPassword.newPasswordLabel")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hm-text-soft)] transition-colors hover:text-[var(--hm-primary)]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--hm-line)]">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${strength.pct}%`, backgroundColor: strengthColor }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-[var(--hm-text-muted)]">{t("resetPassword.strengthLabel")}</span>
                      <span className="font-semibold" style={{ color: strengthColor }}>
                        {strengthText}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label">{t("resetPassword.confirmPasswordLabel")}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hm-text-soft)] transition-colors hover:text-[var(--hm-primary)]"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {requirements.map((r) => (
                  <div key={r.label} className="flex items-center gap-2 text-[12px]">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-200 ${
                        r.ok ? "bg-[#16a34a] text-white" : "bg-[var(--hm-surface-2)] text-[var(--hm-text-muted)]"
                      }`}
                    >
                      {r.ok ? <Check size={11} strokeWidth={3} /> : <Circle size={7} />}
                    </span>
                    <span className={r.ok ? "text-[var(--hm-text)]" : "text-[var(--hm-text-muted)]"}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading || success} className="btn-primary w-full gap-2 mt-2">
                {loading ? (
                  t("resetPassword.updating")
                ) : (
                  <>
                    <KeyRound size={14} />
                    {t("resetPassword.submit")}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
