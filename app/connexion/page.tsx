"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/auth";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const resetSuccess = searchParams.get("reset") === "success";
  const callbackError = searchParams.get("error") === "auth_callback";
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Email ou mot de passe incorrect");
        return;
      }

      const { user } = await res.json();
      setUser(user);
      router.push(redirect);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
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
                Espace client HM Global
              </span>
            </div>
            <h1 className="mb-3 text-3xl font-black text-[var(--hm-text)] md:text-4xl">
              Connexion
            </h1>
            <p className="max-w-md text-sm leading-7 text-[var(--hm-text-soft)]">
              Accédez à votre espace client pour suivre vos commandes, retrouver vos fichiers
              et finaliser votre passage au checkout en toute simplicité.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">Suivi de commande</p>
              <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
                Consultez vos commandes, vos statuts et vos informations de livraison.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">Fichiers centralisés</p>
              <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
                Déposez vos logos et retrouvez les éléments utiles à votre projet.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center">
          <div className="text-center mb-8">
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
          <h2 className="mb-2 text-2xl font-black text-[var(--hm-text)]">Se connecter</h2>
          <p className="text-sm text-[var(--hm-text-soft)]">
            Retrouvez votre panier et finalisez votre commande.
          </p>
          </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_40px_rgba(63,45,88,0.06)]"
        >
          {resetSuccess && (
            <div className="rounded-lg border border-[#86efac] bg-[#ecfdf5] p-3 text-sm text-[#166534]">
              Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.
            </div>
          )}

          {callbackError && (
            <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
              Le lien de confirmation ou de réinitialisation est invalide ou expiré.
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
              {error}
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

          <div>
            <label className="label">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hm-text-muted)] hover:text-[var(--hm-text-soft)]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link
                href="/mot-de-passe-oublie"
                className="text-[10px] text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)]"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full gap-2 mt-2">
            {loading ? "Connexion..." : (<><LogIn size={14} />Se connecter</>)}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--hm-text-soft)]">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-[var(--hm-primary)] hover:underline">
            Créer un compte
          </Link>
        </p>

        {/* Commande sans compte — visible uniquement si on vient du checkout */}
        {redirect === "/checkout" && (
          <div className="mt-5 rounded-[1.5rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-5 text-center">
            <p className="mb-1 text-sm font-semibold text-[var(--hm-text)]">
              Commander sans compte
            </p>
            <p className="mb-4 text-xs leading-6 text-[var(--hm-text-soft)]">
              Saisissez votre email directement au checkout — votre compte sera créé automatiquement après le paiement.
            </p>
            <Link
              href="/checkout"
              className="btn-outline w-full py-3 text-center text-xs"
            >
              Continuer sans me connecter →
            </Link>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-[var(--hm-text-muted)]">
          Le compte client est demandé au moment du checkout, pas dès la configuration produit.
        </p>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ConnexionForm />
    </Suspense>
  );
}
