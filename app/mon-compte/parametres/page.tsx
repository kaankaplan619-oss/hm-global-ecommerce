"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, ChevronLeft, Loader2, User, Lock, Mail } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

// ── Gradient signature HM Global ──────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

type ProfileForm = {
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

  // ── Profile form ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<ProfileForm>({
    firstName: "", lastName: "", phone: "", company: "", siret: "", tvaIntracom: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<ProfileForm>>({});

  // ── Password form ─────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // ── Email change ──────────────────────────────────────────────────────────────
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/connexion");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ user: fresh }) => {
        if (fresh) {
          setUser(fresh);
          setForm({
            firstName:   fresh.firstName   ?? "",
            lastName:    fresh.lastName    ?? "",
            phone:       fresh.phone       ?? "",
            company:     fresh.company     ?? "",
            siret:       fresh.siret       ?? "",
            tvaIntracom: fresh.tvaIntracom ?? "",
          });
        }
      })
      .catch(() => {
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
      .finally(() => setProfileLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Profile submit ────────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<ProfileForm> = {};
    if (!form.firstName.trim()) errs.firstName = "Requis";
    if (!form.lastName.trim())  errs.lastName  = "Requis";
    if (form.siret) {
      const n = form.siret.replace(/[\s.]/g, "");
      if (!/^\d{14}$/.test(n)) errs.siret = "14 chiffres requis";
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setProfileError(""); setProfileSuccess(false); setProfileSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
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
      if (!res.ok) { setProfileError(data.error ?? "Une erreur est survenue"); return; }
      if (data.user) setUser(data.user);
      setProfileSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setProfileError("Impossible de joindre le serveur. Réessayez.");
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Password submit ───────────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess(false);
    if (newPassword.length < 8) { setPasswordError("Le mot de passe doit comporter au moins 8 caractères."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Les mots de passe ne correspondent pas."); return; }
    setPasswordSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { setPasswordError("Erreur lors de la mise à jour. Reconnectez-vous et réessayez."); return; }
      setPasswordSuccess(true);
      setNewPassword(""); setConfirmPassword("");
    } catch {
      setPasswordError("Une erreur est survenue. Réessayez.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Email submit ──────────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(""); setEmailSuccess(false);
    if (!newEmail.includes("@")) { setEmailError("Adresse email invalide."); return; }
    if (newEmail === user?.email) { setEmailError("C'est déjà votre email actuel."); return; }
    setEmailSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) { setEmailError("Impossible de changer l'email. Réessayez."); return; }
      setEmailSuccess(true);
      setNewEmail("");
    } catch {
      setEmailError("Une erreur est survenue. Réessayez.");
    } finally {
      setEmailSaving(false);
    }
  };

  if (!user) return null;

  const isEntreprise = user.type === "entreprise";

  // Helper: section header with icon + gradient bar
  const SectionHeader = ({ icon: Icon, title, accent }: { icon: React.ElementType; title: string; accent: string }) => (
    <div className="flex items-center gap-3 border-b border-[#e6e8ee] px-6 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${accent}18` }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
      <h2 className="text-sm font-bold text-[#3f2d58]">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20">
      <div className="container max-w-2xl">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#6e6280]">
          <Link href="/mon-compte" className="flex items-center gap-1 hover:text-[#7B4FA6] transition-colors">
            <ChevronLeft size={12} />
            Mon compte
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3f2d58]">Paramètres</span>
        </nav>

        {/* Page title */}
        <h1 className="mb-2 text-2xl font-black text-[#3f2d58]">Mes informations</h1>
        <p className="mb-8 text-sm text-[#6e6280]">Gérez votre profil, votre email et votre mot de passe.</p>

        {profileLoading ? (
          <div className="flex items-center justify-center py-20 text-[#6e6280]">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* ── SECTION 1 : Informations personnelles ─────────────────────── */}
            <form onSubmit={handleProfileSubmit} className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <SectionHeader icon={User} title="Informations personnelles" accent="#7B4FA6" />

              <div className="p-6 flex flex-col gap-5">
                {/* Banners */}
                {profileSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#86efac] bg-[#f0fdf4] p-4 text-sm text-[#166534]">
                    <CheckCircle2 size={16} className="shrink-0" />
                    Informations mises à jour avec succès.
                  </div>
                )}
                {profileError && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#b91c1c]">
                    <AlertCircle size={16} className="shrink-0" />
                    {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">
                      Prénom *
                      {fieldErrors.firstName && (
                        <span className="ml-2 font-normal normal-case text-[#ef4444]">{fieldErrors.firstName}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`input ${fieldErrors.firstName ? "border-[#ef4444]" : ""}`}
                      value={form.firstName}
                      onChange={(e) => { setForm((f) => ({ ...f, firstName: e.target.value })); setFieldErrors((x) => ({ ...x, firstName: undefined })); }}
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className="label">
                      Nom *
                      {fieldErrors.lastName && (
                        <span className="ml-2 font-normal normal-case text-[#ef4444]">{fieldErrors.lastName}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`input ${fieldErrors.lastName ? "border-[#ef4444]" : ""}`}
                      value={form.lastName}
                      onChange={(e) => { setForm((f) => ({ ...f, lastName: e.target.value })); setFieldErrors((x) => ({ ...x, lastName: undefined })); }}
                      autoComplete="family-name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Téléphone</label>
                    <input
                      type="tel"
                      className="input"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+33 6 12 34 56 78"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Read-only fields */}
                <div className="grid grid-cols-1 gap-4 border-t border-[#f0f2f7] pt-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Email actuel</label>
                    <div className="input cursor-default select-all text-[#6e6280]">{user.email}</div>
                    <p className="mt-1 text-[10px] text-[#a09bb0]">Modifiable dans la section ci-dessous.</p>
                  </div>
                  <div>
                    <label className="label">Type de compte</label>
                    <div className="input cursor-default text-[#6e6280]">
                      {user.type === "entreprise" ? "🏢 Entreprise" : "👤 Particulier"}
                    </div>
                  </div>
                </div>

                {/* Entreprise fields */}
                {isEntreprise && (
                  <div className="flex flex-col gap-4 border-t border-[#f0f2f7] pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6e6280]">
                      Informations entreprise
                    </h3>
                    <div>
                      <label className="label">Raison sociale</label>
                      <input
                        type="text"
                        className="input"
                        value={form.company}
                        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                        placeholder="Ma Société SARL"
                        autoComplete="organization"
                      />
                    </div>
                    <div>
                      <label className="label">
                        SIRET
                        {fieldErrors.siret && (
                          <span className="ml-2 font-normal normal-case text-[#ef4444]">{fieldErrors.siret}</span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`input font-mono tracking-wider ${fieldErrors.siret ? "border-[#ef4444]" : ""}`}
                        value={form.siret}
                        onChange={(e) => { setForm((f) => ({ ...f, siret: e.target.value })); setFieldErrors((x) => ({ ...x, siret: undefined })); }}
                        placeholder="000 000 000 00000"
                        maxLength={17}
                      />
                    </div>
                    <div>
                      <label className="label">N° TVA intracommunautaire</label>
                      <input
                        type="text"
                        className="input font-mono tracking-wider"
                        value={form.tvaIntracom}
                        onChange={(e) => setForm((f) => ({ ...f, tvaIntracom: e.target.value }))}
                        placeholder="FR 00 000000000"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end border-t border-[#f0f2f7] pt-4">
                  <button type="submit" disabled={profileSaving} className="btn-primary gap-2 min-w-[160px] justify-center">
                    {profileSaving ? (
                      <><Loader2 size={14} className="animate-spin" />Enregistrement…</>
                    ) : (
                      <><CheckCircle2 size={14} />Enregistrer</>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* ── SECTION 2 : Changer d'email ─────────────────────────────────── */}
            <form onSubmit={handleEmailSubmit} className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <SectionHeader icon={Mail} title="Changer d'adresse email" accent="#5BC4D8" />

              <div className="p-6 flex flex-col gap-4">
                {emailSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#86efac] bg-[#f0fdf4] p-4 text-sm text-[#166534]">
                    <CheckCircle2 size={16} className="shrink-0" />
                    Un email de confirmation a été envoyé à votre nouvelle adresse. Cliquez sur le lien pour valider.
                  </div>
                )}
                {emailError && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#b91c1c]">
                    <AlertCircle size={16} className="shrink-0" />
                    {emailError}
                  </div>
                )}

                <div>
                  <label className="label">Nouvel email</label>
                  <input
                    type="email"
                    className="input"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nouvel@email.fr"
                    autoComplete="email"
                    required
                  />
                  <p className="mt-1 text-[10px] text-[#a09bb0]">
                    Un email de confirmation sera envoyé à la nouvelle adresse.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={emailSaving || !newEmail} className="btn-primary gap-2 min-w-[160px] justify-center">
                    {emailSaving ? (
                      <><Loader2 size={14} className="animate-spin" />Envoi…</>
                    ) : (
                      <><Mail size={14} />Changer l&rsquo;email</>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* ── SECTION 3 : Changer le mot de passe ────────────────────────── */}
            <form onSubmit={handlePasswordSubmit} className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <SectionHeader icon={Lock} title="Modifier le mot de passe" accent="#C4387A" />

              <div className="p-6 flex flex-col gap-4">
                {passwordSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#86efac] bg-[#f0fdf4] p-4 text-sm text-[#166534]">
                    <CheckCircle2 size={16} className="shrink-0" />
                    Mot de passe mis à jour avec succès.
                  </div>
                )}
                {passwordError && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#b91c1c]">
                    <AlertCircle size={16} className="shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8 caractères minimum"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={passwordSaving || !newPassword || !confirmPassword} className="btn-primary gap-2 min-w-[160px] justify-center">
                    {passwordSaving ? (
                      <><Loader2 size={14} className="animate-spin" />Mise à jour…</>
                    ) : (
                      <><Lock size={14} />Mettre à jour</>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* ── SECTION 4 : Zone de danger ─────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-[#fecaca] bg-white shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <div className="flex items-center gap-3 border-b border-[#fecaca] bg-[#fef2f2] px-6 py-4">
                <h2 className="text-sm font-bold text-[#b91c1c]">Zone de danger</h2>
              </div>
              <div className="p-6">
                <p className="mb-4 text-sm text-[#6e6280]">
                  La suppression de votre compte est définitive. Toutes vos données seront effacées et cette action est irréversible.
                </p>
                <Link
                  href="/contact?sujet=suppression-compte"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#fecaca] bg-white px-4 py-2.5 text-xs font-semibold text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
                >
                  Demander la suppression du compte
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
