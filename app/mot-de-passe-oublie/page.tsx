"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin;
}

export default function ForgotPasswordPage() {
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
        setError("Impossible d'envoyer l'email de réinitialisation pour le moment.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
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
          <h1 className="text-2xl font-black text-[#f5f5f5] mb-2">Mot de passe oublié</h1>
          <p className="text-sm text-[#555555]">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl flex flex-col gap-4"
        >
          {error && (
            <div className="p-3 bg-[#f8717111] border border-[#f8717133] rounded-lg text-sm text-[#f87171]">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-[#4ade8011] border border-[#4ade8033] rounded-lg text-sm text-[#86efac]">
              Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full gap-2 mt-2">
            {loading ? (
              "Envoi en cours..."
            ) : (
              <>
                <Mail size={14} />
                Recevoir le lien
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#555555] mt-6">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link href="/connexion" className="text-[#c9a96e] hover:underline font-semibold">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
