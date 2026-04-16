"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function InscriptionPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

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

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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

      const { user } = await res.json();
      setUser(user);
      router.push("/mon-compte");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-[#f5f5f5] font-black text-xl tracking-wider uppercase">HM GLOBAL</div>
            <div className="text-[#c9a96e] font-light text-[10px] tracking-[0.25em] uppercase">Agence</div>
          </Link>
          <h1 className="text-2xl font-black text-[#f5f5f5] mb-2">Créer un compte</h1>
          <p className="text-sm text-[#555555]">Créez votre espace client pour commander en ligne</p>
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

          {/* Type selector */}
          <div>
            <label className="label">Type de compte</label>
            <div className="grid grid-cols-2 gap-2">
              {(["particulier", "entreprise"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`p-3 rounded-lg border text-sm font-semibold transition-all capitalize
                    ${type === t
                      ? "border-[#c9a96e] bg-[#c9a96e0a] text-[#f5f5f5]"
                      : "border-[#2a2a2a] text-[#555555] hover:border-[#3a3a3a]"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#8a8a8a]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-[#555555] mt-1">Minimum 8 caractères</p>
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

        <p className="text-center text-sm text-[#555555] mt-6">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-[#c9a96e] hover:underline font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
