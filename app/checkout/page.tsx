"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Lock, ChevronDown, ChevronUp, UserCheck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/data/pricing";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/data/techniques";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotals, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const totals = getTotals();

  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Guard: never call router.push() during render — it accesses `location`
  // in Node.js during SSR/static generation → ReferenceError.
  // Zustand cart is always empty on the server, so this would fire on every
  // server render. Use useEffect to redirect client-side only.
  useEffect(() => {
    if (items.length === 0) {
      router.push("/panier");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId:     i.productId,
            quantity:      i.quantity,
            size:          i.size,
            colorId:       i.color.id,
            colorLabel:    i.color.label,
            colorHex:      i.color.hex,
            technique:     i.technique,
            placement:     i.placement,
            // Logo — transmis depuis le panier si disponible (upload immédiat Mission 2)
            logoFileName:  i.logoFile?.name  ?? null,
            logoFileUrl:   i.logoFile?.url   ?? null,
            logoFilePath:  i.logoFile?.path  ?? null,
            logoFileType:  i.logoFile?.type  ?? null,
            logoFileSize:  i.logoFile?.size  ?? null,
          })),
          billingAddress,
          shippingAddress: sameShipping ? billingAddress : undefined,
          guestEmail: !isAuthenticated ? billingAddress.email : undefined,
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

            {/* Bandeau invité si non connecté */}
            {!isAuthenticated && (
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
                <UserCheck size={16} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--hm-text)]">
                    Commande sans compte
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--hm-text-soft)]">
                    Votre email sera utilisé pour le suivi de commande. Vous pourrez créer un compte après le paiement.
                  </p>
                </div>
                <Link
                  href="/connexion?redirect=/checkout"
                  className="shrink-0 rounded-full border border-[var(--hm-line)] px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] transition-colors hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                >
                  Se connecter
                </Link>
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
                {/* Email — toujours visible (pré-rempli si connecté) */}
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
