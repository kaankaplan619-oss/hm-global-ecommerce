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
  Landmark,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/data/pricing";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/data/techniques";
import { uploadLogoToSupabase } from "@/lib/uploadLogo";
import AddressAutocomplete from "@/components/checkout/AddressAutocomplete";
import CompanyAutocomplete from "@/components/checkout/CompanyAutocomplete";

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
                          {item.product.shortName}
                          {item.printConfig
                            ? ` · ${item.printConfig.quantity} ex.`
                            : ` × ${item.quantity}`}
                        </p>
                        <p className="text-[10px] text-[var(--hm-text-muted)]">
                          {item.printConfig
                            ? `Impression · ${item.printConfig.finish === "mat" ? "Mat" : item.printConfig.finish === "brillant" ? "Brillant" : "Premium"} · ${item.printConfig.faces === "recto" ? "Recto" : "Recto-verso"}`
                            : `${TECHNIQUE_LABELS[item.technique]} · ${PLACEMENT_LABELS[item.placement]} · ${item.size}`}
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
                      accept=".png,.svg"
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
  // Méthode de paiement choisie : Stripe (CB/Link) ou virement bancaire V1 manuel.
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "bank_transfer">("stripe");

  const [billingAddress, setBillingAddress] = useState({
    email:      user?.email ?? "",
    firstName:  user?.firstName ?? "",
    lastName:   user?.lastName ?? "",
    company:    user?.company ?? "",
    siret:      "",           // entreprises FR uniquement
    vatNumber:  "",           // TVA intracommunautaire (optionnel pour FR, requis UE)
    street:     "",
    city:       "",
    postalCode: "",
    country:    "FR",
    phone:      user?.phone ?? "",
  });
  // Type de facturation : "particulier" (B2C, default) ou "entreprise" (B2B).
  // Conditionne l'affichage des champs Société/SIRET/TVA et la validation.
  // Sauvé aussi dans localStorage avec le reste pour pré-remplir au retour.
  const [accountType, setAccountType] = useState<"particulier" | "entreprise">("particulier");
  const [sameShipping, setSameShipping] = useState(true);
  // Sauvegarde locale (localStorage) des coordonnées pour faciliter les
  // commandes récurrentes. RGPD friendly : 100% côté client, jamais envoyé
  // serveur sans action utilisateur explicite (la case doit être cochée).
  const [saveAddress, setSaveAddress] = useState(false);

  // Charge l'adresse sauvegardée au mount si dispo. Priorité plus basse que les
  // infos auth.user (qui sont rechargées dans un autre useEffect).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("hm_saved_billing_address");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // Garde-fou : si le contenu n'est pas un objet (corrompu / null / array),
      // on purge silencieusement et on laisse le formulaire vierge plutôt que
      // de crash plus tard sur du `.length` undefined.
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        localStorage.removeItem("hm_saved_billing_address");
        return;
      }
      const saved: Record<string, string> = parsed;
      // Patch uniquement les champs vides (pas écraser auth.user data si présent)
      setBillingAddress((prev) => ({
        email:      prev.email      || saved.email      || "",
        firstName:  prev.firstName  || saved.firstName  || "",
        lastName:   prev.lastName   || saved.lastName   || "",
        company:    prev.company    || saved.company    || "",
        siret:      prev.siret      || saved.siret      || "",
        vatNumber:  prev.vatNumber  || saved.vatNumber  || "",
        street:     prev.street     || saved.street     || "",
        city:       prev.city       || saved.city       || "",
        postalCode: prev.postalCode || saved.postalCode || "",
        country:    prev.country    || saved.country    || "FR",
        phone:      prev.phone      || saved.phone      || "",
      }));
      // Si une adresse est déjà sauvegardée, on coche la case par défaut
      // (l'utilisateur veut visiblement qu'on retienne ses infos).
      setSaveAddress(true);
      // Restaure le type de compte si sauvegardé
      if (saved.accountType === "entreprise") setAccountType("entreprise");
    } catch {
      // localStorage corrupted or parse error → ignore silently
    }
  }, []);

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

  // Pré-remplissage automatique depuis le COMPTE : si le client est connecté,
  // on récupère l'adresse de sa dernière commande (l'objet user ne porte pas
  // l'adresse postale). Ainsi il ne retape pas ses coordonnées à chaque fois.
  // On ne remplit que les champs encore vides (ne jamais écraser sa saisie).
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = await res.json();
        const orders: { createdAt?: string; billingAddress?: Record<string, string>; shippingAddress?: Record<string, string> }[] =
          Array.isArray(data.orders) ? data.orders : [];
        if (!orders.length || cancelled) return;
        // La plus récente d'abord.
        const last = orders.slice().sort((a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())[0];
        const a = (last.billingAddress && Object.keys(last.billingAddress).length
          ? last.billingAddress
          : last.shippingAddress) ?? {};
        if (cancelled) return;
        setBillingAddress((prev) => ({
          ...prev,
          email:      prev.email      || a.email      || "",
          firstName:  prev.firstName  || a.firstName  || "",
          lastName:   prev.lastName   || a.lastName   || "",
          company:    prev.company    || a.company    || "",
          siret:      prev.siret      || a.siret      || "",
          vatNumber:  prev.vatNumber  || a.vatNumber  || "",
          street:     prev.street     || a.street     || "",
          city:       prev.city       || a.city       || "",
          postalCode: prev.postalCode || a.postalCode || "",
          country:    prev.country    || a.country    || "FR",
          phone:      prev.phone      || a.phone      || "",
        }));
        if (a.company || a.siret) setAccountType("entreprise");
      } catch { /* hors-ligne / pas d'historique → on laisse vierge */ }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

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

  // ── Items print avec printConfig manquant (guard défensif) ─────────────────
  // Normalement impossible si store/cart.ts persiste correctement printConfig.
  // Couche de sécurité : si un item print n'a plus de config (localStorage
  // corrompu, migration de données), on bloque avant que le serveur plante en 500.
  const printItemsMissingConfig = items.filter(
    (item) => item.technique === "print" && !item.printConfig
  );
  const allPrintConfigsReady = printItemsMissingConfig.length === 0;

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    // Sauvegarde locale au moment du submit (cas où l'utilisateur a coché la
    // case puis modifié les champs ensuite — on récupère l'état final).
    if (saveAddress && typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "hm_saved_billing_address",
          JSON.stringify({ ...billingAddress, accountType }),
        );
      } catch {/* quota or disabled */}
    }
    setLoading(true);
    try {
      const payload = {
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
          logoEffect:              i.logoEffect              ?? null,
          logoPlacementTransform:  i.logoPlacementTransform  ?? null,
          batRef:                  i.batRef                  ?? null,
          // Print — transmis uniquement pour les commandes impression
          printConfig: i.printConfig ?? null,
        })),
        billingAddress,
        shippingAddress: sameShipping ? billingAddress : undefined,
      };

      // ── Branche virement bancaire ─────────────────────────────────────────
      // V1 manuel : on crée la commande en awaiting_bank_transfer puis on
      // redirige vers la page de confirmation qui affiche IBAN/BIC/référence.
      // Aucun appel Stripe — la production ne démarre qu'après réception.
      if (paymentMethod === "bank_transfer") {
        const res = await fetch("/api/orders/create-bank-transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur création commande virement");
        const { orderId, orderNumber } = await res.json();
        useCartStore.getState().clearCart();
        router.push(
          `/commande-confirmee?orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(orderNumber ?? "")}&method=bank_transfer`
        );
        return;
      }

      // ── Branche Stripe (CB / Link / Apple Pay / Google Pay) ───────────────
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    allPrintConfigsReady &&
    (billingAddress.email ?? "").includes("@") &&
    (billingAddress.firstName ?? "").trim().length > 0 &&
    (billingAddress.street ?? "").trim().length > 0 &&
    (billingAddress.city ?? "").trim().length > 0 &&
    // Validation B2B : si Entreprise, nom de société + SIRET valide (14 chiffres) requis.
    // Le n° TVA reste optionnel (uniquement utile UE hors France).
    // Optional chaining partout : protège contre du localStorage stale (HMR ou
    // ancien schéma) où company/siret pourraient être undefined.
    (accountType === "particulier" || (
      (billingAddress.company ?? "").trim().length > 0 &&
      (billingAddress.siret ?? "").length === 14
    ));

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

            {/* Avertissement impression — configuration incomplète (guard défensif) */}
            {!allPrintConfigsReady && (
              <div className="flex items-start gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-xs text-[#b91c1c]">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Configuration impression incomplète</p>
                  <p className="mt-0.5 text-[#b91c1c]/80">
                    La configuration de votre carte de visite est introuvable (session expirée ou page rechargée).
                    Veuillez{" "}
                    <Link href="/impression/cartes-de-visite" className="font-bold underline hover:text-[#b91c1c]">
                      recommencer la personnalisation
                    </Link>
                    {" "}pour finaliser votre commande.
                  </p>
                </div>
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

              {/* ── Toggle Particulier / Entreprise ─────────────────────
                 Préalable au remplissage des coordonnées. Une entreprise a
                 besoin de fournir : Nom de société + SIRET (obligatoire FR)
                 + N° TVA intracommunautaire (optionnel mais utile pour les
                 entreprises EU hors FR — facturation HT possible). Les champs
                 sont conditionnels : ils n'apparaissent QUE si "Entreprise"
                 est sélectionné, pour ne pas alourdir le checkout B2C. */}
              <div className="mb-5 flex gap-2 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-1">
                {[
                  { id: "particulier" as const, label: "Particulier", icon: "👤" },
                  { id: "entreprise"  as const, label: "Entreprise",  icon: "🏢" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAccountType(opt.id)}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      accountType === opt.id
                        ? "bg-white text-[var(--hm-primary)] shadow-sm"
                        : "text-[var(--hm-text-soft)] hover:text-[var(--hm-text)]"
                    }`}
                  >
                    <span className="mr-2">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Champs spécifiques Entreprise — visible uniquement en B2B */}
              {accountType === "entreprise" && (
                <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-rose)]/30 p-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label">
                      Nom de la société *
                      <span className="ml-1 text-[10px] font-normal text-[var(--hm-text-muted)]">
                        — tape le nom ou le SIRET, on remplit le reste
                      </span>
                    </label>
                    {/* Autocomplete via recherche-entreprises.api.gouv.fr.
                       Au clic sur une suggestion : remplit company + siret +
                       street + postalCode + city d'un coup (un seul setState
                       pour éviter le bug de state batching qu'on avait sur
                       AddressAutocomplete). */}
                    <CompanyAutocomplete
                      value={billingAddress.company ?? ""}
                      onChange={(company) =>
                        setBillingAddress({ ...billingAddress, company })
                      }
                      onSelect={({ company, siret, street, postcode, city }) =>
                        setBillingAddress({
                          ...billingAddress,
                          company,
                          siret,
                          street:     street   || billingAddress.street,
                          postalCode: postcode || billingAddress.postalCode,
                          city:       city     || billingAddress.city,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">SIRET *</label>
                    <input
                      type="text"
                      className="input"
                      value={billingAddress.siret ?? ""}
                      onChange={(e) => {
                        // Filtre tout caractère non-numérique + limite 14 chiffres
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 14);
                        setBillingAddress({ ...billingAddress, siret: cleaned });
                      }}
                      placeholder="14 chiffres"
                      inputMode="numeric"
                      pattern="[0-9]{14}"
                      maxLength={14}
                    />
                    {(billingAddress.siret?.length ?? 0) > 0 && (billingAddress.siret?.length ?? 0) !== 14 && (
                      <p className="mt-1 text-[10px] text-[var(--hm-primary)]">
                        {billingAddress.siret?.length ?? 0}/14 chiffres
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">
                      TVA intracommunautaire
                      <span className="ml-1 text-[10px] font-normal text-[var(--hm-text-muted)]">
                        (optionnel — UE hors FR)
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={billingAddress.vatNumber ?? ""}
                      onChange={(e) => setBillingAddress({ ...billingAddress, vatNumber: e.target.value.toUpperCase() })}
                      placeholder="FR12345678901"
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

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
                  {/* Autocomplete via api-adresse.data.gouv.fr (Base Adresse
                     Nationale, gratuit, sans clé). Au clic sur une suggestion,
                     code postal + ville se remplissent automatiquement. Si
                     l'API ne répond pas, la saisie manuelle reste fonctionnelle. */}
                  <AddressAutocomplete
                    value={billingAddress.street}
                    onChange={(street) =>
                      setBillingAddress({ ...billingAddress, street })
                    }
                    onSelect={({ street, postcode, city }) =>
                      setBillingAddress({
                        ...billingAddress,
                        street,
                        postalCode: postcode || billingAddress.postalCode,
                        city: city || billingAddress.city,
                      })
                    }
                    placeholder="12 rue de la Paix — commencez à taper…"
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

              {/* ── Sauvegarde locale des coordonnées ───────────────────
                 Case optionnelle qui sauve toutes les infos saisies dans
                 localStorage. Au prochain checkout, les champs seront
                 pré-remplis automatiquement. RGPD friendly : 100% local,
                 effacable depuis les params navigateur. Le client peut
                 décocher pour purger immédiatement. */}
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="save-address"
                  checked={saveAddress}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSaveAddress(checked);
                    if (typeof window === "undefined") return;
                    if (!checked) {
                      // Décoche → purge immédiate
                      localStorage.removeItem("hm_saved_billing_address");
                    } else {
                      // Coche → sauvegarde l'état actuel du formulaire
                      // + le type de compte (Particulier / Entreprise)
                      try {
                        localStorage.setItem(
                          "hm_saved_billing_address",
                          JSON.stringify({ ...billingAddress, accountType }),
                        );
                      } catch {/* quota or disabled */}
                    }
                  }}
                  className="h-4 w-4 accent-[var(--hm-primary)]"
                />
                <label
                  htmlFor="save-address"
                  className="cursor-pointer text-sm text-[var(--hm-text-soft)]"
                >
                  Enregistrer mes coordonnées pour mes prochaines commandes
                  <span className="ml-2 text-[10px] text-[var(--hm-text-muted)]">
                    (stocké localement sur votre appareil)
                  </span>
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

              {/* ── Sélecteur méthode de paiement ─────────────────────────
                 Deux options : Stripe (CB/Link/Apple Pay/Google Pay, instantané)
                 ou virement bancaire (V1 manuel, la production démarre après
                 réception). Visuellement deux cartes cliquables, état actif
                 surligné avec la couleur accent HM. */}
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    id: "stripe" as const,
                    label: "Carte bancaire",
                    sub: "CB, Apple Pay, Google Pay, Link",
                    icon: <CreditCard size={16} />,
                  },
                  {
                    id: "bank_transfer" as const,
                    label: "Virement bancaire",
                    sub: "Production après réception",
                    icon: <Landmark size={16} />,
                  },
                ].map((opt) => {
                  const active = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                        active
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]/40 shadow-sm"
                          : "border-[var(--hm-line)] bg-white hover:border-[var(--hm-text-soft)]/40"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-[var(--hm-primary)] text-white"
                            : "bg-[var(--hm-surface)] text-[var(--hm-text-soft)]"
                        }`}
                      >
                        {opt.icon}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--hm-text)]">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-[var(--hm-text-muted)]">
                          {opt.sub}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "stripe" ? (
                <>
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
                    <Lock size={14} className="shrink-0 text-[#4ade80]" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--hm-text)]">
                        Paiement 100% sécurisé
                      </p>
                      <p className="text-[10px] text-[var(--hm-text-muted)]">
                        Carte bancaire, Apple Pay, Google Pay, Stripe Link — Propulsé par Stripe
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 text-xs text-[var(--hm-text-muted)]">
                    Vous serez redirigé vers la page de paiement sécurisée Stripe après validation.
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: "Visa",       sub: "Mastercard" },
                      { label: "Apple Pay",  sub: null },
                      { label: "Google Pay", sub: null },
                      { label: "Link",       sub: "by Stripe" },
                    ].map((badge) => (
                      <div
                        key={badge.label}
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--hm-line)] bg-white px-3 shadow-sm"
                      >
                        <CreditCard size={14} className="text-[var(--hm-text-soft)]" />
                        <span className="text-[11px] font-semibold text-[var(--hm-text)]">
                          {badge.label}
                        </span>
                        {badge.sub && (
                          <span className="text-[10px] font-medium text-[var(--hm-text-muted)]">
                            · {badge.sub}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4 text-xs text-[var(--hm-text-soft)]">
                  <p className="flex items-start gap-2 text-[var(--hm-text)]">
                    <Landmark size={14} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
                    <span className="font-semibold">
                      Après validation, vous recevrez les coordonnées bancaires (IBAN/BIC) et votre référence de commande.
                    </span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    La production démarre <strong>après réception du virement</strong> sur notre compte.
                    Indiquez bien votre référence de commande dans le libellé du virement.
                  </p>
                </div>
              )}
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
                          {item.product.shortName}
                          {item.printConfig
                            ? ` · ${item.printConfig.quantity} ex.`
                            : ` × ${item.quantity}`}
                        </p>
                        <p className="text-[10px] text-[var(--hm-text-muted)]">
                          {item.printConfig
                            ? `Impression · ${item.printConfig.finish === "mat" ? "Mat" : item.printConfig.finish === "brillant" ? "Brillant" : "Premium"} · ${item.printConfig.faces === "recto" ? "Recto" : "Recto-verso"}`
                            : `${TECHNIQUE_LABELS[item.technique]} · ${PLACEMENT_LABELS[item.placement]} · ${item.size}`}
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
                ) : paymentMethod === "bank_transfer" ? (
                  <>
                    <Landmark size={14} />
                    Valider et obtenir les coordonnées bancaires
                  </>
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
