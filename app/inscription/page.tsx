"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function InscriptionPage() {
  const router = useRouter();

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
        body: JSON.stringify({ ...form, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Erreur lors de la création du compte");
        return;
      }

      const data = await res.json();
      setSuccessMessage(
        data.message ??
          "Votre compte a été créé. Vérifiez votre boîte mail pour confirmer votre adresse email avant de vous connecter."
      );
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
              Créer un compte
            </h1>
            <p className="max-w-md text-sm leading-7 text-[var(--hm-text-soft)]">
              Créez votre espace client pour retrouver votre panier, suivre vos commandes
              et valider votre checkout simplement.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">Compte clair et simple</p>
              <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
                Inscription rapide pour enregistrer vos informations utiles et suivre vos projets.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">Confirmation email</p>
              <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
                Votre adresse email doit être confirmée avant la première connexion.
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
            <h2 className="mb-2 text-2xl font-black text-[var(--hm-text)]">Créer mon compte</h2>
            <p className="text-sm text-[var(--hm-text-soft)]">
              Renseignez vos informations pour accéder à votre espace client.
            </p>
          </div>

          {successMessage ? (
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_40px_rgba(63,45,88,0.06)]">
              <div className="rounded-lg border border-[#86efac] bg-[#ecfdf5] p-3 text-sm text-[#166534]">
                {successMessage}
              </div>
              <p className="text-sm leading-relaxed text-[var(--hm-text-soft)]">
                Une fois votre adresse email confirmée, vous pourrez vous connecter et accéder à votre espace client.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/connexion")}
                  className="btn-primary w-full"
                >
                  Aller à la connexion
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  className="btn-outline w-full"
                >
                  Modifier mon inscription
                </button>
              </div>
            </div>
          ) : (
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
              <label className="label">Type de compte</label>
              <div className="grid grid-cols-2 gap-2">
                {(["particulier", "entreprise"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-lg border p-3 text-sm font-semibold transition-all capitalize
                      ${type === t
                        ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-text)]"
                        : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/35"
                      }`}
                  >
                    {t === "particulier" ? "👤 Particulier" : "🏢 Entreprise"}
                  </button>
                ))}
              </div>
            </div>

            {/* Entreprise fields */}
            {type === "entreprise" && (
              <>
                <div>
                  <label className="label">Société *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ma Société SARL"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">SIRET *</label>
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
                <label className="label">Prénom *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Jean"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Nom *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Dupont"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className="input"
                placeholder="vous@exemple.fr"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Téléphone *</label>
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
              <label className="label">Mot de passe *</label>
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
              <p className="mt-1 text-[10px] text-[var(--hm-text-muted)]">Minimum 8 caractères</p>
              <p className="mt-1 text-[10px] text-[var(--hm-text-muted)]">
                Après inscription, vous devrez confirmer votre adresse email avant de vous connecter.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full gap-2 mt-2"
            >
              {loading ? "Création en cours..." : (
                <>
                  <UserPlus size={14} />
                  Créer mon compte
                </>
              )}
            </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[var(--hm-text-soft)]">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-semibold text-[var(--hm-primary)] hover:underline">
              Se connecter
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-[var(--hm-text-muted)]">
            Le compte client vous permet ensuite de suivre vos commandes et vos validations.
          </p>
        </div>
      </div>
    </div>
  );
}
