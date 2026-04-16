"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/auth";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/mon-compte";
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
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-[#f5f5f5] font-black text-xl tracking-wider uppercase">HM GLOBAL</div>
            <div className="text-[#c9a96e] font-light text-[10px] tracking-[0.25em] uppercase">Agence</div>
          </Link>
          <h1 className="text-2xl font-black text-[#f5f5f5] mb-2">Connexion</h1>
          <p className="text-sm text-[#555555]">Accédez à votre espace client pour suivre vos commandes</p>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#8a8a8a]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link href="/mot-de-passe-oublie" className="text-[10px] text-[#555555] hover:text-[#c9a96e]">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full gap-2 mt-2">
            {loading ? "Connexion..." : (<><LogIn size={14} />Se connecter</>)}
          </button>
        </form>

        <p className="text-center text-sm text-[#555555] mt-6">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-[#c9a96e] hover:underline font-semibold">Créer un compte</Link>
        </p>
        <p className="text-center text-xs text-[#3a3a3a] mt-4">Un compte est requis pour passer une commande.</p>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <ConnexionForm />
    </Suspense>
  );
}
