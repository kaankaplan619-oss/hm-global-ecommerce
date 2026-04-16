"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/data/pricing";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/data/techniques";

type Step = "addresses" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotals, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const totals = getTotals();

  const [step, setStep] = useState<Step>("addresses");
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);

  const [billingAddress, setBillingAddress] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    company: user?.company ?? "",
    street: "",
    city: "",
    postalCode: "",
    country: "FR",
    phone: user?.phone ?? "",
  });
  const [sameShipping, setSameShipping] = useState(true);

  if (!isAuthenticated) {
    router.push("/connexion?redirect=/checkout");
    return null;
  }

  if (items.length === 0) {
    router.push("/panier");
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Create payment intent
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // userId comes from the server session — do not send it from the client
          items: items.map((i) => ({
            productId:  i.productId,
            quantity:   i.quantity,
            size:       i.size,
            colorId:    i.color.id,
            colorLabel: i.color.label,
            colorHex:   i.color.hex,
            technique:  i.technique,
            placement:  i.placement,
          })),
          billingAddress,
          shippingAddress: sameShipping ? billingAddress : undefined,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création du paiement");

      const { clientSecret, orderId } = await res.json();

      // Pass total so the payment page can display the amount without re-fetching
      router.push(
        `/checkout/paiement?clientSecret=${encodeURIComponent(clientSecret)}&orderId=${encodeURIComponent(orderId)}&total=${totals.totalTTC}`
      );
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-5xl">
        <h1 className="text-2xl font-black text-[#f5f5f5] mb-8">Finaliser ma commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Address section */}
            <div className="p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <h2 className="text-sm font-bold text-[#f5f5f5] mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#c9a96e] text-[#0a0a0a] text-[10px] font-black flex items-center justify-center">1</span>
                Adresse de facturation
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Prénom *</label>
                  <input
                    type="text"
                    className="input"
                    value={billingAddress.firstName}
                    onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                    placeholder="Jean"
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
                  />
                </div>
                {user?.type === "entreprise" && (
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
                        <div className="input flex items-center justify-between text-[#8a8a8a] cursor-default select-all">
                          <span className="font-mono tracking-wider">{user.siret}</span>
                          <span className="text-[10px] text-[#555555] ml-2 shrink-0">Enregistré</span>
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
                  />
                </div>
                <div>
                  <label className="label">Téléphone *</label>
                  <input
                    type="tel"
                    className="input"
                    value={billingAddress.phone}
                    onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              {/* Same shipping address */}
              <div className="mt-5 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="same-shipping"
                  checked={sameShipping}
                  onChange={(e) => setSameShipping(e.target.checked)}
                  className="w-4 h-4 accent-[#c9a96e]"
                />
                <label htmlFor="same-shipping" className="text-sm text-[#8a8a8a] cursor-pointer">
                  Adresse de livraison identique à la facturation
                </label>
              </div>
            </div>

            {/* Payment section */}
            <div className="p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <h2 className="text-sm font-bold text-[#f5f5f5] mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#c9a96e] text-[#0a0a0a] text-[10px] font-black flex items-center justify-center">2</span>
                Paiement sécurisé
              </h2>

              <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg mb-4">
                <Lock size={14} className="text-[#4ade80]" />
                <div>
                  <p className="text-xs font-semibold text-[#f5f5f5]">Paiement 100% sécurisé</p>
                  <p className="text-[10px] text-[#555555]">
                    Carte bancaire, Apple Pay, Google Pay — Propulsé par Stripe
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#555555] mb-4">
                Vous serez redirigé vers la page de paiement sécurisée Stripe après validation.
              </p>

              <div className="flex gap-3">
                {["💳", "🍎", "G"].map((icon) => (
                  <div key={icon} className="w-12 h-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded flex items-center justify-center text-sm">
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <p className="text-[11px] text-[#555555] leading-relaxed">
              En passant commande, vous acceptez nos{" "}
              <Link href="/cgv" className="text-[#c9a96e] hover:underline">CGV</Link>{" "}
              et notre{" "}
              <Link href="/confidentialite" className="text-[#c9a96e] hover:underline">
                politique de confidentialité
              </Link>
              . Vous avez 30 minutes après la commande pour l&rsquo;annuler.
            </p>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <button
                className="w-full flex items-center justify-between mb-4"
                onClick={() => setShowSummary(!showSummary)}
              >
                <span className="text-sm font-bold text-[#f5f5f5]">
                  Récapitulatif ({totals.totalItems} article{totals.totalItems > 1 ? "s" : ""})
                </span>
                {showSummary ? <ChevronUp size={14} className="text-[#555555]" /> : <ChevronDown size={14} className="text-[#555555]" />}
              </button>

              {showSummary && (
                <div className="flex flex-col gap-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2 text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#8a8a8a] truncate">
                          {item.product.shortName} × {item.quantity}
                        </p>
                        <p className="text-[#555555] text-[10px]">
                          {TECHNIQUE_LABELS[item.technique]} · {PLACEMENT_LABELS[item.placement]} · {item.size}
                        </p>
                      </div>
                      <span className="text-[#f5f5f5] shrink-0 font-semibold">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                  <div className="divider-gold" />
                </div>
              )}

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between text-xs text-[#8a8a8a]">
                  <span>Sous-total HT</span>
                  <span>{formatPrice(totals.subtotalHT)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#8a8a8a]">
                  <span>TVA (20%)</span>
                  <span>{formatPrice(totals.tva)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#8a8a8a]">
                  <span>Livraison</span>
                  <span className={totals.freeShipping ? "text-[#4ade80]" : ""}>
                    {totals.freeShipping ? "Offerte" : formatPrice(totals.shipping)}
                  </span>
                </div>
              </div>

              <div className="divider-gold mb-4" />

              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-[#f5f5f5] text-sm">Total TTC</span>
                <span className="text-xl font-black text-[#c9a96e]">
                  {formatPrice(totals.totalTTC)}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !billingAddress.street || !billingAddress.city}
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

              <p className="text-center text-[10px] text-[#555555] mt-3">
                🔒 Paiement chiffré SSL — Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
