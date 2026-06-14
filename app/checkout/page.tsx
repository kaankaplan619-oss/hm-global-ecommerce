"use client";

import { useState, useEffect, useMemo } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { track } from "@/lib/track";
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

// ─── Logo confirmation ────────────────────────────────────────────────────────

function isPublicAssetUrl(url?: string) {
  return !!url && /^https?:\/\//i.test(url);
}

function LogoConfirmationSection({
  sessionId,
}: {
  sessionId: string;
}) {
  const t = useT();
  const { items, updateLogoFile } = useCartStore();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const itemsNeedingLogo = items.filter(
    (item) => item.logoFile?.name && !isPublicAssetUrl(item.logoFile?.url)
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
          [itemId]: t("checkout.logo_upload_error"),
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        [itemId]: t("checkout.logo_upload_error"),
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
        {itemsNeedingLogo.length === 1 ? t("checkout.logo_to_save_one") : t("checkout.logo_to_save_many")}
      </h2>
      <p className="mb-4 text-xs text-[#92400e]">
        {itemsNeedingLogo.length === 1
          ? t("checkout.logo_save_intro_one")
          : `${itemsNeedingLogo.length} ${t("checkout.logo_save_intro_many")}`}
      </p>

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          if (!item.logoFile?.name) return null;

          const done = isPublicAssetUrl(item.logoFile?.url);
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
                {item.product.shortName} · {item.color.label} · {t("checkout.size_label")} {item.size}
              </p>
              <p className="mb-3 text-[11px] text-[var(--hm-text-soft)]">
                {t("checkout.file_label")} <span className="font-mono">{item.logoFile.name}</span>
              </p>

              {done ? (
                <div className="flex items-center gap-2 text-xs text-[#166534]">
                  <CheckCircle size={13} />
                  {t("checkout.logo_saved")}
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
                        {t("checkout.uploading")}
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        {t("checkout.select_file")} {item.logoFile.name}
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
  const t = useT();
  const router = useRouter();
  const { items, getTotals } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const totals = getTotals();

  // Mesure : début de checkout (une fois au montage)
  useEffect(() => {
    track("begin_checkout");
  }, []);

  const [hydrated, setHydrated] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  // Erreur bloquante au moment de la commande (ex. rupture de stock Printful
  // détectée par le garde serveur) — affichée au-dessus du bouton de paiement.
  const [orderError, setOrderError] = useState<string | null>(null);
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
  // Consentement prospection (#88, RGPD/CNIL) : case NON pré-cochée, opt-in
  // actif uniquement. Stocké sur la commande (+ profil si connecté).
  const [marketingConsent, setMarketingConsent] = useState(false);

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
  }, [isAuthenticated, user]);

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

  // ── Items needing logo confirmation ────────────────────────────────────────
  const itemsNeedingLogo = items.filter(
    (item) => item.logoFile?.name && !isPublicAssetUrl(item.logoFile?.url)
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
    setOrderError(null);
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
          composedPreviewUrl:      i.composedPreviewUrl      ?? null,
          composedPreviewBack:     i.composedPreviewBack     ?? null,
          // Print — transmis uniquement pour les commandes impression
          printConfig: i.printConfig ?? null,
        })),
        billingAddress,
        shippingAddress: sameShipping ? billingAddress : undefined,
        guestEmail: isAuthenticated ? undefined : billingAddress.email,
        marketingConsent,
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
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? t("checkout.error_create_bank_transfer"));
        }
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

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? t("checkout.error_create_payment"));
      }

      const { clientSecret, orderId, orderNumber } = await res.json();

      router.push(
        `/checkout/paiement?clientSecret=${encodeURIComponent(clientSecret)}&orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(orderNumber ?? "")}&total=${totals.totalTTC}`
      );
    } catch (err) {
      console.error(err);
      setOrderError(err instanceof Error ? err.message : t("checkout.error_generic"));
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
          {t("checkout.page_title")}
        </h1>

        {!isAuthenticated && (
          <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-5 py-4 text-xs text-[var(--hm-text-soft)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong className="text-[var(--hm-text)]">{t("checkout.guest_title")}</strong>{" "}
              {t("checkout.guest_subtitle")}
            </p>
            <Link
              href="/connexion?redirect=/checkout"
              className="shrink-0 font-bold text-[var(--hm-primary)] hover:underline"
            >
              {t("checkout.guest_login_link")}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Formulaire ───────────────────────────────────── */}
          <div className="flex flex-col gap-6 lg:col-span-2">

            {/* Logo confirmation — si des logos n'ont pas encore d'URL Supabase */}
            <LogoConfirmationSection sessionId={sessionId} />

            {/* Avertissement logos manquants — bloque le paiement */}
            {!allLogosReady && (
              <div className="flex items-start gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-xs text-[#92400e]">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                {t("checkout.logos_warning")}
              </div>
            )}

            {/* Avertissement impression — configuration incomplète (guard défensif) */}
            {!allPrintConfigsReady && (
              <div className="flex items-start gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-xs text-[#b91c1c]">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{t("checkout.print_config_incomplete_title")}</p>
                  <p className="mt-0.5 text-[#b91c1c]/80">
                    {t("checkout.print_config_incomplete_body_before")}{" "}
                    <Link href="/impression/cartes-de-visite" className="font-bold underline hover:text-[#b91c1c]">
                      {t("checkout.print_config_incomplete_link")}
                    </Link>
                    {" "}{t("checkout.print_config_incomplete_body_after")}
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
                {t("checkout.billing_address_title")}
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
                  { id: "particulier" as const, label: t("checkout.account_type_individual"), icon: "👤" },
                  { id: "entreprise"  as const, label: t("checkout.account_type_company"),    icon: "🏢" },
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
                      {t("checkout.company_name_label")}
                      <span className="ml-1 text-[10px] font-normal text-[var(--hm-text-muted)]">
                        {t("checkout.company_name_hint")}
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
                    <label className="label">{t("checkout.siret_label")}</label>
                    <input
                      type="text"
                      className="input"
                      value={billingAddress.siret ?? ""}
                      onChange={(e) => {
                        // Filtre tout caractère non-numérique + limite 14 chiffres
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 14);
                        setBillingAddress({ ...billingAddress, siret: cleaned });
                      }}
                      placeholder={t("checkout.siret_placeholder")}
                      inputMode="numeric"
                      pattern="[0-9]{14}"
                      maxLength={14}
                    />
                    {(billingAddress.siret?.length ?? 0) > 0 && (billingAddress.siret?.length ?? 0) !== 14 && (
                      <p className="mt-1 text-[10px] text-[var(--hm-primary)]">
                        {billingAddress.siret?.length ?? 0}{t("checkout.siret_counter_suffix")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">
                      {t("checkout.vat_label")}
                      <span className="ml-1 text-[10px] font-normal text-[var(--hm-text-muted)]">
                        {t("checkout.vat_hint")}
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
                  <label className="label">{t("checkout.email_label")}</label>
                  <input
                    type="email"
                    className="input"
                    value={billingAddress.email}
                    onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                    placeholder={t("checkout.email_placeholder")}
                    autoComplete="email"
                    required
                    readOnly={isAuthenticated}
                  />
                </div>

                <div>
                  <label className="label">{t("checkout.first_name_label")}</label>
                  <input
                    type="text"
                    className="input"
                    value={billingAddress.firstName}
                    onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                    placeholder={t("checkout.first_name_placeholder")}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="label">{t("checkout.last_name_label")}</label>
                  <input
                    type="text"
                    className="input"
                    value={billingAddress.lastName}
                    onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })}
                    placeholder={t("checkout.last_name_placeholder")}
                    autoComplete="family-name"
                  />
                </div>

                {(isAuthenticated && user?.type === "entreprise") && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="label">{t("checkout.company_label")}</label>
                      <input
                        type="text"
                        className="input"
                        value={billingAddress.company}
                        onChange={(e) => setBillingAddress({ ...billingAddress, company: e.target.value })}
                        placeholder={t("checkout.company_placeholder")}
                      />
                    </div>
                    {user.siret && (
                      <div className="sm:col-span-2">
                        <label className="label">{t("checkout.siret_label_short")}</label>
                        <div className="input flex cursor-default select-all items-center justify-between text-[var(--hm-text-soft)]">
                          <span className="font-mono tracking-wider">{user.siret}</span>
                          <span className="ml-2 shrink-0 text-[10px] text-[var(--hm-text-muted)]">{t("checkout.saved_badge")}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="label">{t("checkout.address_label")}</label>
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
                    placeholder={t("checkout.address_placeholder")}
                  />
                </div>
                <div>
                  <label className="label">{t("checkout.postal_code_label")}</label>
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
                  <label className="label">{t("checkout.city_label")}</label>
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
                  <label className="label">{t("checkout.phone_label")}</label>
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
                  {t("checkout.same_shipping_label")}
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
                  {t("checkout.save_address_label")}
                  <span className="ml-2 text-[10px] text-[var(--hm-text-muted)]">
                    {t("checkout.save_address_hint")}
                  </span>
                </label>
              </div>

              {/* ── Consentement prospection (#88 — RGPD/CNIL) ──────────
                 Case NON pré-cochée (opt-in actif obligatoire). Distinct des
                 emails transactionnels (qui partent sans consentement). */}
              <div className="mt-3 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="marketing-consent"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--hm-primary)]"
                />
                <label
                  htmlFor="marketing-consent"
                  className="cursor-pointer text-[12.5px] leading-snug text-[var(--hm-text-soft)]"
                >
                  {t("checkout.marketing_consent_before")}{" "}
                  <Link href="/confidentialite" className="text-[var(--hm-primary)] hover:underline">
                    {t("checkout.privacy_policy_link")}
                  </Link>{t("checkout.marketing_consent_after")}
                </label>
              </div>
            </div>

            {/* Section paiement */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-6">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-[var(--hm-text)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--hm-primary)] text-[10px] font-black text-white">
                  2
                </span>
                {t("checkout.payment_title")}
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
                    label: t("checkout.method_card_label"),
                    sub: t("checkout.method_card_sub"),
                    icon: <CreditCard size={16} />,
                  },
                  {
                    id: "bank_transfer" as const,
                    label: t("checkout.method_bank_label"),
                    sub: t("checkout.method_bank_sub"),
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
                        {t("checkout.secure_payment_title")}
                      </p>
                      <p className="text-[10px] text-[var(--hm-text-muted)]">
                        {t("checkout.secure_payment_sub")}
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 text-xs text-[var(--hm-text-muted)]">
                    {t("checkout.stripe_redirect_note")}
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
                      {t("checkout.bank_info_main")}
                    </span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    {t("checkout.bank_info_detail_before")} <strong>{t("checkout.bank_info_detail_strong")}</strong> {t("checkout.bank_info_detail_after")}
                  </p>
                </div>
              )}
            </div>

            {/* CGV */}
            <p className="text-[11px] leading-relaxed text-[var(--hm-text-muted)]">
              {t("checkout.cgv_before")}{" "}
              <Link href="/cgv" className="text-[var(--hm-primary)] hover:underline">{t("checkout.cgv_link")}</Link>{" "}
              {t("checkout.cgv_between")}{" "}
              <Link href="/confidentialite" className="text-[var(--hm-primary)] hover:underline">
                {t("checkout.privacy_policy_link")}
              </Link>
              {t("checkout.cgv_after")}
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
                  {t("checkout.summary_title")} ({totals.totalItems} {totals.totalItems > 1 ? t("checkout.items_plural") : t("checkout.items_singular")})
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
                            ? ` · ${item.printConfig.quantity} ${t("checkout.units_abbrev")}`
                            : ` × ${item.quantity}`}
                        </p>
                        <p className="text-[10px] text-[var(--hm-text-muted)]">
                          {item.printConfig
                            ? `${t("checkout.print_label")} · ${item.printConfig.finish === "mat" ? t("checkout.finish_matte") : item.printConfig.finish === "brillant" ? t("checkout.finish_glossy") : t("checkout.finish_premium")} · ${item.printConfig.faces === "recto" ? t("checkout.faces_single") : t("checkout.faces_double")}`
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
                  <span>{t("checkout.subtotal_ht")}</span>
                  <span>{formatPrice(totals.subtotalHT)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>{t("checkout.vat_line")}</span>
                  <span>{formatPrice(totals.tva)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>{t("checkout.shipping_line")}</span>
                  <span className={totals.freeShipping ? "text-[#4ade80]" : ""}>
                    {totals.freeShipping ? t("checkout.shipping_free") : formatPrice(totals.shipping)}
                  </span>
                </div>
              </div>

              <div className="divider-brand mb-4" />

              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--hm-text)]">{t("checkout.total_ttc")}</span>
                <span className="text-xl font-black text-[var(--hm-primary)]">
                  {formatPrice(totals.totalTTC)}
                </span>
              </div>

              {orderError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-xs font-semibold text-red-700">{orderError}</p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !canSubmit}
                className="btn-primary w-full gap-2"
                title={!allLogosReady ? t("checkout.save_logos_title") : undefined}
              >
                {loading ? (
                  t("checkout.processing")
                ) : paymentMethod === "bank_transfer" ? (
                  <>
                    <Landmark size={14} />
                    {t("checkout.submit_bank_transfer")}
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    {t("checkout.pay")} {formatPrice(totals.totalTTC)}
                  </>
                )}
              </button>

              {!allLogosReady && (
                <p className="mt-2 text-center text-[10px] text-[#92400e]">
                  {t("checkout.save_logos_hint")}
                </p>
              )}

              <p className="mt-3 text-center text-[10px] text-[var(--hm-text-muted)]">
                🔒 {t("checkout.ssl_footer")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
