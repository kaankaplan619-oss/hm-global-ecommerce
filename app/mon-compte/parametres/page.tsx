"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  siret: string;
  tvaIntracom: string;
};

export default function ParametresPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();

  const [form, setForm] = useState<FormState>({
    firstName:   "",
    lastName:    "",
    phone:       "",
    company:     "",
    siret:       "",
    tvaIntracom: "",
  });

  const [loading, setLoading]     = useState(true);   // initial fetch
  const [saving, setSaving]       = useState(false);   // PATCH in progress
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<FormState>>({});

  // ── Redirect if not authenticated ───────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) router.push("/connexion");
  }, [isAuthenticated, router]);

  // ── Fetch fresh profile from DB on mount ────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ user: freshUser }) => {
        if (freshUser) {
          // Sync Zustand store with fresh data
          setUser(freshUser);
          setForm({
            firstName:   freshUser.firstName   ?? "",
            lastName:    freshUser.lastName    ?? "",
            phone:       freshUser.phone       ?? "",
            company:     freshUser.company     ?? "",
            siret:       freshUser.siret       ?? "",
            tvaIntracom: freshUser.tvaIntracom ?? "",
          });
        }
      })
      .catch(() => {
        // Fallback: use cached Zustand data
        if (user) {
          setForm({
            firstName:   user.firstName   ?? "",
            lastName:    user.lastName    ?? "",
            phone:       user.phone       ?? "",
            company:     user.company     ?? "",
            siret:       user.siret       ?? "",
            tvaIntracom: user.tvaIntracom ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const update = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
    setError("");
    setSuccess(false);
  };

  // ── Client-side validation ───────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Partial<FormState> = {};

    if (!form.firstName.trim()) errs.firstName = "Requis";
    if (!form.lastName.trim())  errs.lastName  = "Requis";

    if (form.siret) {
      const normalized = form.siret.replace(/[\s.]/g, "");
      if (!/^\d{14}$/.test(normalized)) errs.siret = "14 chiffres requis";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name:   form.firstName.trim(),
          last_name:    form.lastName.trim(),
          phone:        form.phone.trim()       || null,
          company:      form.company.trim()     || null,
          siret:        form.siret.replace(/[\s.]/g, "") || null,
          tva_intracom: form.tvaIntracom.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue");
        return;
      }

      // Update Zustand store with the fresh user returned by the API
      if (data.user) setUser(data.user);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Impossible de joindre le serveur. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const isEntreprise = user.type === "entreprise";

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-2xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555555] mb-6">
          <Link href="/mon-compte" className="hover:text-[#f5f5f5] transition-colors flex items-center gap-1">
            <ChevronLeft size={12} />
            Mon compte
          </Link>
          <span>/</span>
          <span className="text-[#f5f5f5]">Paramètres</span>
        </nav>

        <h1 className="text-2xl font-black text-[#f5f5f5] mb-8">Mes informations</h1>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-[#4ade8011] border border-[#4ade8033] rounded-xl text-sm text-[#4ade80]">
            <CheckCircle size={16} className="shrink-0" />
            Informations mises à jour avec succès.
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-[#f8717111] border border-[#f8717133] rounded-xl text-sm text-[#f87171]">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#555555]">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* ── Informations personnelles ──────────────────────────────── */}
            <section className="p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <h2 className="text-sm font-bold text-[#f5f5f5] mb-5">Informations personnelles</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Prénom *
                    {fieldErrors.firstName && (
                      <span className="ml-2 text-[#f87171] normal-case font-normal">
                        {fieldErrors.firstName}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={`input ${fieldErrors.firstName ? "border-[#f87171]" : ""}`}
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label className="label">
                    Nom *
                    {fieldErrors.lastName && (
                      <span className="ml-2 text-[#f87171] normal-case font-normal">
                        {fieldErrors.lastName}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={`input ${fieldErrors.lastName ? "border-[#f87171]" : ""}`}
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    autoComplete="family-name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Téléphone</label>
                  <input
                    type="tel"
                    className="input"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Read-only: email and account type */}
              <div className="mt-5 pt-5 border-t border-[#1e1e1e] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <div className="input text-[#555555] cursor-default select-all">
                    {user.email}
                  </div>
                  <p className="text-[10px] text-[#3a3a3a] mt-1">
                    Pour changer d&rsquo;email, contactez le support.
                  </p>
                </div>
                <div>
                  <label className="label">Type de compte</label>
                  <div className="input text-[#555555] cursor-default capitalize">
                    {user.type === "entreprise" ? "🏢 Entreprise" : "👤 Particulier"}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Informations entreprise ────────────────────────────────── */}
            {isEntreprise && (
              <section className="p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl">
                <h2 className="text-sm font-bold text-[#f5f5f5] mb-5">Informations entreprise</h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label">Raison sociale</label>
                    <input
                      type="text"
                      className="input"
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      placeholder="Ma Société SARL"
                      autoComplete="organization"
                    />
                  </div>

                  <div>
                    <label className="label">
                      SIRET
                      {fieldErrors.siret && (
                        <span className="ml-2 text-[#f87171] normal-case font-normal">
                          {fieldErrors.siret}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`input font-mono tracking-wider ${fieldErrors.siret ? "border-[#f87171]" : ""}`}
                      value={form.siret}
                      onChange={(e) => update("siret", e.target.value)}
                      placeholder="000 000 000 00000"
                      maxLength={17}
                    />
                    <p className="text-[10px] text-[#555555] mt-1">
                      14 chiffres — spaces et points acceptés
                    </p>
                  </div>

                  <div>
                    <label className="label">N° TVA intracommunautaire</label>
                    <input
                      type="text"
                      className="input font-mono tracking-wider"
                      value={form.tvaIntracom}
                      onChange={(e) => update("tvaIntracom", e.target.value)}
                      placeholder="FR 00 000000000"
                    />
                    <p className="text-[10px] text-[#555555] mt-1">
                      Optionnel — apparaîtra sur vos factures
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4">
              <Link href="/mon-compte" className="btn-ghost text-sm">
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary gap-2 min-w-[160px] justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
