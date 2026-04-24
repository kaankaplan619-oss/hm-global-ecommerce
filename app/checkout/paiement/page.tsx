"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/data/pricing";

// ─── Stripe singleton ─────────────────────────────────────────────────────────
// Instantiated outside the component to avoid recreating on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

// ─── Stripe Elements appearance (dark premium) ────────────────────────────────
const STRIPE_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary:       "#c9a96e",
    colorBackground:    "#111111",
    colorText:          "#f5f5f5",
    colorTextSecondary: "#8a8a8a",
    colorTextPlaceholder: "#555555",
    colorDanger:        "#f87171",
    colorSuccess:       "#4ade80",
    fontFamily:         "Arial, Helvetica, sans-serif",
    fontSizeBase:       "14px",
    borderRadius:       "8px",
    spacingUnit:        "4px",
  },
  rules: {
    ".Input": {
      border:      "1px solid #2a2a2a",
      boxShadow:   "none",
      outline:     "none",
      padding:     "12px",
      color:       "#f5f5f5",
      background:  "#1a1a1a",
    },
    ".Input:focus": {
      border:    "1px solid #c9a96e",
      boxShadow: "0 0 0 2px #c9a96e22",
    },
    ".Label": {
      color:       "#8a8a8a",
      fontSize:    "11px",
      fontWeight:  "600",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
    ".Error": {
      color: "#f87171",
    },
  },
};

// ─── Payment form (inner — uses Stripe hooks) ─────────────────────────────────

function PaymentForm({
  orderId,
  orderNumber,
  totalTTC,
}: {
  orderId: string;
  orderNumber: string;
  totalTTC: number | null;
}) {
  const stripe       = useStripe();
  const elements     = useElements();
  const router       = useRouter();
  const { clearCart } = useCartStore();

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string>("");
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setError("");
      setLoading(true);

      // confirmPayment with redirect: "if_required"
      // → returns immediately for card / Apple Pay / Google Pay
      // → redirects to return_url for bank-based methods (rare for FR e-commerce)
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          // Fallback URL for redirect-based payment methods
          return_url: `${window.location.origin}/mon-compte/commandes`,
        },
      });

      if (stripeError) {
        setError(
          stripeError.message ??
            "Une erreur est survenue lors du paiement. Réessayez."
        );
        setLoading(false);
        return;
      }

      if (
        paymentIntent?.status === "succeeded" ||
        paymentIntent?.status === "processing"
      ) {
        setSucceeded(true);
        clearCart();

        // Redirect to public confirmation page (works for guests too)
        setTimeout(() => {
          const params = new URLSearchParams();
          if (orderId)     params.set("orderId",     orderId);
          if (orderNumber) params.set("orderNumber", orderNumber);
          router.push(`/commande-confirmee?${params.toString()}`);
        }, 1200);
      } else {
        setError("Statut de paiement inattendu. Contactez le support.");
        setLoading(false);
      }
    },
    [stripe, elements, orderId, router, clearCart]
  );

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#4ade8022] border border-[#4ade8033] flex items-center justify-center">
          <CheckCircle size={32} className="text-[#4ade80]" />
        </div>
        <h2 className="text-xl font-black text-[#f5f5f5]">Paiement accepté !</h2>
        <p className="text-sm text-[#555555]">
          Vous allez être redirigé vers votre commande…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Stripe PaymentElement — renders CB / Apple Pay / Google Pay */}
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "auto", googlePay: "auto" },
        }}
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-[#f8717111] border border-[#f8717133] rounded-lg text-sm text-[#f87171]">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className={`btn-primary w-full gap-2 py-4 text-sm mt-2
          ${loading || !stripe ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <Lock size={14} />
        {loading
          ? "Traitement en cours…"
          : totalTTC
          ? `Payer ${formatPrice(totalTTC)}`
          : "Payer"}
      </button>

      <p className="text-center text-[10px] text-[#3a3a3a]">
        🔒 Paiement chiffré SSL — propulsé par Stripe
      </p>
    </form>
  );
}

// ─── Page wrapper (reads URL params, loads Elements) ─────────────────────────

function PaiementContent() {
  const searchParams = useSearchParams();
  const clientSecret  = searchParams.get("clientSecret");
  const orderId       = searchParams.get("orderId") ?? "";
  const orderNumber   = searchParams.get("orderNumber") ?? "";
  const totalParam    = searchParams.get("total");
  const totalTTC      = totalParam ? parseFloat(totalParam) : null;

  if (!clientSecret) {
    return (
      <div className="pt-24 pb-20 text-center">
        <p className="text-[#555555] mb-4">Session de paiement expirée ou invalide.</p>
        <Link href="/checkout" className="btn-outline text-sm">
          Retour au panier
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/checkout"
            className="flex items-center gap-1 text-xs text-[#555555] hover:text-[#f5f5f5] transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            Retour
          </Link>
          <h1 className="text-2xl font-black text-[#f5f5f5]">Paiement sécurisé</h1>
          <p className="text-sm text-[#555555] mt-1">
            Vos données de paiement sont chiffrées et traitées par Stripe.
          </p>
        </div>

        {/* Card */}
        <div className="p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl">
          {/* Trust badge */}
          <div className="flex items-center gap-2 mb-6 pb-5 border-b border-[#1e1e1e]">
            <Lock size={12} className="text-[#4ade80]" />
            <span className="text-[11px] text-[#555555]">
              Connexion sécurisée — TLS 1.3 — Stripe PCI-DSS niveau 1
            </span>
          </div>

          {/* Stripe Elements */}
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: STRIPE_APPEARANCE,
              locale: "fr",
            }}
          >
            <PaymentForm orderId={orderId} orderNumber={orderNumber} totalTTC={totalTTC} />
          </Elements>
        </div>

        {/* Order reference */}
        {orderId && (
          <p className="text-center text-[10px] text-[#3a3a3a] mt-4">
            Référence commande : {orderId}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Default export — Suspense boundary required for useSearchParams ──────────

export default function PaiementPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 pb-20 flex items-center justify-center min-h-[50vh]">
          <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaiementContent />
    </Suspense>
  );
}
