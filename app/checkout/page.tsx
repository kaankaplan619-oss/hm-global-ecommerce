"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Lock,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/data/pricing";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/data/techniques";
import { uploadLogoToSupabase } from "@/lib/uploadLogo";

// ─── Auth gate ────────────────────────────────────────────────────────────────

function CheckoutAuthGate({
  onLoginSuccess,
}: {
  onLoginSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const { getTotals, items } = useCartStore();
  const totals = getTotals();
  const [showItems, setShowItems] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Erreur de connexion");
      setUser(data.user);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 pt-24">
      <div className="container max-w-5xl">
        <h1 className="mb-8 text-2xl font-black text-[var(--hm-text)]">
          Finaliser ma commande
        </h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Connexion ──────────────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-6">
              <h2 className="mb-1 text-sm font-bold text-[var(--hm-text)]">
                Connectez-vous pour finaliser
              </h2>
              <p className="mb-5 text-xs text-[var(--hm-text-soft)]">
                Votre panier est conservé. La connexion est requise pour valider votre commande et enregistrer votre logo.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.fr"
                    autoComplete="email"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <div>
                  <label className="label">Mot de passe *</label>
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
                    <AlertCircle size={12} className="shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading || !email || !password}
                  className="btn-primary gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Connexion…
                    </>
                  ) : (
                    "Se connecter et continuer"
                  )}
                </button>

                <div className="flex flex-col gap-2 text-center">
                  <p className="text-xs text-[var(--hm-text-muted)]">
                    Pas encore de compte ?{" "}
                    <Link
                      href="/inscription?redirect=/checkout"
                      className="font-semibold text-[var(--hm-primary)] hover:underline"
                    >
                      Créer un compte
                    </Link>{" "}
                    — revenez ensuite sur cette page.
                  </p>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-xs text-[var(--hm-text-muted)] hover:text-[var(--hm-primary)]"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Récap panier ───────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[var(--hm-line)] bg-white p-5">
              <button
                className="mb-4 flex w-full items-center justify-between"
                onClick={() => setShowItems(!showItems)}
              >
                <span className="text-sm font-bold text-[var(--hm-text)]">
                  Votre panier ({totals.totalItems} article{totals.totalItems > 1 ? "s" : ""})
                </span>
                {showItems
                  ? <ChevronUp size={14} className="text-[var(--hm-text-muted)]" />
                  : <ChevronDown size={14} className="text-[var(--hm-text-muted)]" />
                }
              </button>

              {showItems && (
                <div className="mb-4 flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[var(--hm-text-soft)]">
                          {item.product.shortName} × {item.quantity}
                        </p>
                        <p className="text-[10px] text-[var(--hm-text-muted)]">
                          {TECHNIQUE_LABELS[item.technique]} · {PLACEMENT_LABELS[item.placement]} · {item.size}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-[var(--hm-text)]">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                  <div className="divider-brand" />
                </div>
              )}

              <div className="mb-4 flex flex-col gap-2">
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>Sous-total HT</span>
                  <span>{formatPrice(totals.subtotalHT)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>TVA (20%)</span>
                  <span>{formatPrice(totals.tva)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>Livraison</span>
                  <span className={totals.freeShipping ? "text-[#4ade80]" : ""}>
                    {totals.freeShipping ? "Offerte" : formatPrice(totals.shipping)}
                  </span>
                </div>
              </div>
              <div className="divider-brand mb-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--hm-text)]">Total TTC</span>
                <span className="text-xl font-black text-[var(--hm-primary)]">
                  {formatPrice(totals.totalTTC)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Logo confirmation ────────────────────────────────────────────────────────

function LogoConfirmationSection({
  sessionId,
}: {
  sessionId: string;
}) {
  const { items, updateLogoFile } = useCartStore();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const itemsNeedingLogo = items.filter(
    (item) => item.logoFile?.name && !item.logoFile?.url
  );

  if (itemsNeedingLogo.length === 0) return null;

  const handleReUpload = async (itemId: string, file: File) => {
    setUploading((prev) => ({ ...prev, [itemId]: true }));
    setErrors((prev) => ({ ...prev, [itemId]: "" }));
    try {
      const { data, error } = await uploadLogoToSupabase(file, sessionId);
      if (data) {
        updateLogoFile(itemId, {
          name: file.name,
          size: file.size,
          type: file.type,
          url: data.logoFileUrl,
          path: data.logoPath,
          uploadedAt: new Date().toISOString(),
        });
      } else if (error) {
        setErrors((prev) => ({
          ...prev,
          [itemId]: "Erreur lors de l'envoi. Veuillez réessayer.",
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        [itemId]: "Erreur lors de l'envoi. Veuillez réessayer.",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-6">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[var(--hm-text)]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f59e0b] text-[10px] font-black text-white">
          !
        </span>
        {itemsNeedingLogo.length === 1 ? "Logo à enregistrer" : "Logos à enregistrer"}
      </h2>
      <p className="mb-4 text-xs text-[#92400e]">
        {itemsNeedingLogo.length === 1
          ? "Un logo a été sélectionné localement mais n'a pas encore été envoyé vers le serveur. Sélectionnez à nouveau le fichier pour finaliser votre commande."
          : `${itemsNeedingLogo.length} logos doivent être confirmés avant de finaliser votre commande.`}
      </p>

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          if (!item.logoFile?.name) return null;

          const done = !!item.logoFile?.url;
          const isUploading = uploading[item.id];

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 ${
                done
                  ? "border-[#86efac] bg-[#ecfdf5]"
                  : "border-[#fde68a] bg-white"
              }`}
            >
              <p className="mb-1 text-xs font-semibold text-[var(--hm-text)]">
                {item.product.shortName} · {item.color.label} · Taille {item.size}
              </p>
              <p className="mb-3 text-[11px] text-[var(--hm-text-soft)]">
                Fichier : <span className="font-mono">{item.logoFile.name}</span>
              </p>

              {done ? (
                <div className="flex items-center gap-2 text-xs text-[#166534]">
                  <CheckCircle size={13} />
                  Logo enregistré
                </div>
              ) : (
                <>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--hm-primary)]/50 bg-[var(--hm-surface)] px-4 py-3 text-xs font-medium text-[var(--hm-primary)] transition-colors hover:bg-[var(--hm-accent-soft-rose)]/30 ${
                      isUploading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        Sélectionner {item.logoFile.name}
                      </>
                    )}
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.svg"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReUpload(item.id, file);
                      }}
                    />
                  </label>
                  {errors[item.id] && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-[#b91c1c]">
                      <AlertCircle size={11} />
                      {errors[item.id]}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main checkout ────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotals } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const totals = getTotals();

  const [hydrated, setHydrated] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  // Forces re-render after login to re-check logo states
  const [loginDone, setLoginDone] = useState(false);

  const [billingAddress, setBillingAddress] = useState({
    email:      user?.email ?? "",
    firstName:  user?.firstName ?? "",
    lastName:   user?.lastName ?? "",
    company:    user?.company ?? "",
    street:     "",
    city:       "",
    postalCode: "",
    country:    "FR",
    phone:      user?.phone ?? "",
  });
  const [sameShipping, setSameShipping] = useState(true);

  // Stable session ID for Supabase Storage paths
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "ssr";
    const stored = sessionStorage.getItem("hm_session_id");
    if (stored) return stored;
    const id = crypto.randomUUID();
    sessionStorage.setItem("hm_session_id", id);
    return id;
  }, []);

  // Pre-fill billing address when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      setBillingAddress((prev) => ({
        ...prev,
        email:     user.email      || prev.email,
        firstName: user.firstName  || prev.firstName,
        lastName:  user.lastName   || prev.lastName,
        phone:     user.phone      || prev.phone,
        company:   user.company    || prev.company,
      }));
    }
  }, [isAuthenticated, user, loginDone]);

  // Trigger rehydration and mark when done — prevents premature empty-cart redirect
  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useCartStore.persist.rehydrate();
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      router.push("/panier");
    }
  }, [hydrated, items.length, router]);

  if (!hydrated || items.length === 0) return null;

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <CheckoutAuthGate
        onLoginSuccess={() => setLoginDone(true)}
      />
    );
  }

  // ── Items needing logo confirmation ────────────────────────────────────────
  const itemsNeedingLogo = items.filter(
    (item) => item.logoFile?.name && !item.logoFile?.url
  );
  const allLogosReady = itemsNeedingLogo.length === 0;

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId:    i.productId,
            quantity:     i.quantity,
            size:         i.size,
            colorId:      i.color.id,
            colorLabel:   i.color.label,
            colorHex:     i.color.hex,
            technique:    i.technique,
            placement:    i.placement,
            logoFileName: i.logoFile?.name  ?? null,
            logoFileUrl:  i.logoFile?.url   ?? null,
            logoFilePath: i.logoFile?.path  ?? null,
            logoFileType: i.logoFile?.type  ?? null,
            logoFileSize: i.logoFile?.size  ?? null,
          })),
          billingAddress,
          shippingAddress: sameShipping ? billingAddress : undefined,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création du paiement");

      const { clientSecret, orderId, orderNumber } = await res.json();

      router.push(
        `/checkout/paiement?clientSecret=${encodeURIComponent(clientSecret)}&orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(orderNumber ?? "")}&total=${totals.totalTTC}`
      );
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const canSubmit =
    allLogosReady &&
    billingAddress.email.includes("@") &&
    billingAddress.firstName.trim().length > 0 &&
    billingAddress.street.trim().length > 0 &&
    billingAddress.city.trim().length > 0;

  return (
    <div className="pb-20 pt-24">
      <div className="container max-w-5xl">
        <h1 className="mb-8 text-2xl font-black text-[var(--hm-text)]">
          Finaliser ma commande
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Formulaire ───────────────────────────────────── */}
          <div className="flex flex-col gap-6 lg:col-span-2">

            {/* Logo confirmation — si des logos n'ont pas encore d'URL Supabase */}
            <LogoConfirmationSection sessionId={sessionId} />

            {/* Avertissement logos manquants — bloque le paiement */}
            {!allLogosReady && (
              <div className="flex items-start gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-xs text-[#92400e]">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                Veuillez enregistrer tous les logos ci-dessus avant de procéder au paiement.
              </div>
            )}

            {/* Section adresse */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-6">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-[var(--hm-text)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--hm-primary)] text-[10px] font-black text-white">
                  1
                </span>
                Adresse de facturation
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    className="input"
                    value={billingAddress.email}
                    onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                    placeholder="vous@exemple.fr"
                    autoComplete="email"
                    required
                    readOnly={isAuthenticated}
                  />
                </div>

                <div>
                  <label className="label">Prénom *</label>
                  <input
                    type="text"
                    className="input"
                    value={billingAddress.firstName}
                    onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                    placeholder="Jean"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="label">Nom *</label>
                  <input
                    type="text"
                    className="input"
                    value={billingAddress.lastName}
                    onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })}
                    placeholder="Dupont"
                    autoComplete="family-name"
                  />
                </div>

                {(isAuthenticated && user?.type === "entreprise") && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="label">Société</label>
                      <input
                        type="text"
                        className="input"
                        value={billingAddress.company}
                        onChange={(e) => setBillingAddress({ ...billingAddress, company: e.target.value })}
                        placeholder="Ma Société SARL"
                      />
                    </div>
                    {user.siret && (
                      <div className="sm:col-span-2">
                        <label className="label">SIRET</label>
                        <div className="input flex cursor-default select-all items-center justify-between text-[var(--hm-text-soft)]">
                          <span className="font-mono tracking-wider">{user.siret}</span>
                          <span className="ml-2 shrink-0 text-[10px] text-[var(--hm-text-muted)]">Enregistré</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="label">Adresse *</label>
                  <input
                    type="text"
                    className="input"
                    value={billingAddress.street}
                    onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                    placeholder="12 rue de la Paix"
                    autoComplete="street-address"
                  />
                </div>
                <div>
                  <label className="label">Code postal *</label>
                  <input
                    type="text"
                    className="input"
                    value={billingAddress.postalCode}
                    onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                    placeholder="67000"
                    autoComplete="postal-code"
                  />
                </div>
                <div>
                  <label className="label">Ville *</label>
                  <input
                    type="text"
                    className="input"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                    placeholder="Strasbourg"
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input
                    type="tel"
                    className="input"
                    value={billingAddress.phone}
                    onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="same-shipping"
                  checked={sameShipping}
                  onChange={(e) => setSameShipping(e.target.checked)}
                  className="h-4 w-4 accent-[var(--hm-primary)]"
                />
                <label
                  htmlFor="same-shipping"
                  className="cursor-pointer text-sm text-[var(--hm-text-soft)]"
                >
                  Adresse de livraison identique à la facturation
                </label>
              </div>
            </div>

            {/* Section paiement */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-6">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-[var(--hm-text)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--hm-primary)] text-[10px] font-black text-white">
                  2
                </span>
                Paiement sécurisé
              </h2>

              <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
                <Lock size={14} className="shrink-0 text-[#4ade80]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--hm-text)]">
                    Paiement 100% sécurisé
                  </p>
                  <p className="text-[10px] text-[var(--hm-text-muted)]">
                    Carte bancaire, Apple Pay, Google Pay — Propulsé par Stripe
                  </p>
                </div>
              </div>

              <p className="mb-4 text-xs text-[var(--hm-text-muted)]">
                Vous serez redirigé vers la page de paiement sécurisée Stripe après validation.
              </p>

              <div className="flex gap-2">
                {["💳 CB", "🍎 Pay", "G Pay"].map((icon) => (
                  <div
                    key={icon}
                    className="flex h-8 min-w-[60px] items-center justify-center rounded-lg border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 text-[11px] font-semibold text-[var(--hm-text-soft)]"
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* CGV */}
            <p className="text-[11px] leading-relaxed text-[var(--hm-text-muted)]">
              En passant commande, vous acceptez nos{" "}
              <Link href="/cgv" className="text-[var(--hm-primary)] hover:underline">CGV</Link>{" "}
              et notre{" "}
              <Link href="/confidentialite" className="text-[var(--hm-primary)] hover:underline">
                politique de confidentialité
              </Link>
              . Vous avez 30 minutes après la commande pour l&rsquo;annuler.
            </p>
          </div>

          {/* ── Récapitulatif ─────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[var(--hm-line)] bg-white p-5">
              <button
                className="mb-4 flex w-full items-center justify-between"
                onClick={() => setShowSummary(!showSummary)}
              >
                <span className="text-sm font-bold text-[var(--hm-text)]">
                  Récapitulatif ({totals.totalItems} article{totals.totalItems > 1 ? "s" : ""})
                </span>
                {showSummary
                  ? <ChevronUp size={14} className="text-[var(--hm-text-muted)]" />
                  : <ChevronDown size={14} className="text-[var(--hm-text-muted)]" />
                }
              </button>

              {showSummary && (
                <div className="mb-4 flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[var(--hm-text-soft)]">
                          {item.product.shortName} × {item.quantity}
                        </p>
                        <p className="text-[10px] text-[var(--hm-text-muted)]">
                          {TECHNIQUE_LABELS[item.technique]} · {PLACEMENT_LABELS[item.placement]} · {item.size}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-[var(--hm-text)]">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                  <div className="divider-brand" />
                </div>
              )}

              <div className="mb-4 flex flex-col gap-2">
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>Sous-total HT</span>
                  <span>{formatPrice(totals.subtotalHT)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>TVA (20%)</span>
                  <span>{formatPrice(totals.tva)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>Livraison</span>
                  <span className={totals.freeShipping ? "text-[#4ade80]" : ""}>
                    {totals.freeShipping ? "Offerte" : formatPrice(totals.shipping)}
                  </span>
                </div>
              </div>

              <div className="divider-brand mb-4" />

              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--hm-text)]">Total TTC</span>
                <span className="text-xl font-black text-[var(--hm-primary)]">
                  {formatPrice(totals.totalTTC)}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !canSubmit}
                className="btn-primary w-full gap-2"
                title={!allLogosReady ? "Enregistrez tous les logos avant de payer" : undefined}
              >
                {loading ? (
                  "Traitement en cours..."
                ) : (
                  <>
                    <CreditCard size={14} />
                    Payer {formatPrice(totals.totalTTC)}
                  </>
                )}
              </button>

              {!allLogosReady && (
                <p className="mt-2 text-center text-[10px] text-[#92400e]">
                  Enregistrez les logos ci-dessus pour continuer.
                </p>
              )}

              <p className="mt-3 text-center text-[10px] text-[var(--hm-text-muted)]">
                🔒 Paiement chiffré SSL — Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
