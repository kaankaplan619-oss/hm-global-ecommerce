"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-[#f5f5f5] font-black text-xl tracking-wider uppercase">HM GLOBAL</div>
            <div className="text-[#c9a96e] font-light text-[10px] tracking-[0.25em] uppercase">Agence</div>
          </Link>
          <h1 className="text-2xl font-black text-[#f5f5f5] mb-2">{t("resetPassword.title")}</h1>
          <p className="text-sm text-[#555555]">
            {t("resetPassword.subtitle")}
          </p>
        </div>

        <div className="p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl">
          {checkingSession ? (
            <p className="text-sm text-[#555555]">{t("resetPassword.checkingLink")}</p>
          ) : !hasRecoverySession ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#f8717111] border border-[#f8717133] rounded-lg text-sm text-[#f87171]">
                {t("resetPassword.linkInvalid")}
              </div>
              <Link href="/mot-de-passe-oublie" className="btn-outline w-full text-center">
                {t("resetPassword.requestNewLink")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-[#f8717111] border border-[#f8717133] rounded-lg text-sm text-[#f87171]">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-[#4ade8011] border border-[#4ade8033] rounded-lg text-sm text-[#86efac]">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#8a8a8a]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#8a8a8a]"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
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
