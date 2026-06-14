"use client";

/**
 * _stripe-payment.tsx
 *
 * Chargé dynamiquement avec `ssr: false` depuis page.tsx.
 * Ce composant est donc JAMAIS exécuté côté serveur — @stripe/stripe-js
 * et @stripe/react-stripe-js accèdent à `location` / `window` au chargement
 * du module, ce qui crashait toutes les serverless functions Next.js.
 */

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js/pure";
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
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useT } from "@/components/i18n/I18nProvider";

// ─── Stripe singleton — jamais appelé server-side ─────────────────────────────
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

// ─── Stripe Elements appearance (cohérent avec le design HM Global) ───────────
const STRIPE_APPEARANCE = {
  theme: "stripe" as const,
  variables: {
    colorPrimary:         "#b13f74",
    colorBackground:      "#ffffff",
    colorText:            "#3f2d58",
    colorTextSecondary:   "#6e6280",
    colorTextPlaceholder: "#8a8198",
    colorDanger:          "#dc2626",
    fontFamily:           "Arial, Helvetica, sans-serif",
    fontSizeBase:         "14px",
    borderRadius:         "8px",
    spacingUnit:          "4px",
  },
  rules: {
    ".Input": {
      border:     "1px solid #e6e8ee",
      boxShadow:  "none",
      outline:    "none",
      padding:    "12px",
      color:      "#3f2d58",
      background: "#ffffff",
    },
    ".Input:focus": {
      border:    "1px solid #b13f74",
      boxShadow: "0 0 0 3px rgba(177,63,116,0.12)",
    },
    ".Label": {
      color:         "#6e6280",
      fontSize:      "11px",
      fontWeight:    "600",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
    ".Error": {
      color: "#dc2626",
    },
  },
};

// ─── Payment form (inner — uses Stripe hooks) ─────────────────────────────────

function PaymentForm({
  orderId,
  orderNumber,
  totalTTC,
  userName,
  userEmail,
}: {
  orderId:    string;
  orderNumber: string;
  totalTTC:   number | null;
  userName:   string;
  userEmail:  string;
}) {
  const t             = useT();
  const stripe        = useStripe();
  const elements      = useElements();
  const router        = useRouter();
  const { clearCart } = useCartStore();

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string>("");
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setError("");
      setLoading(true);

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/mon-compte/commandes`,
        },
      });

      if (stripeError) {
        setError(
          stripeError.message ??
            t("stripePayment.error.generic")
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
        setTimeout(() => {
          const params = new URLSearchParams();
          if (orderId)     params.set("orderId",     orderId);
          if (orderNumber) params.set("orderNumber", orderNumber);
          router.push(`/commande-confirmee?${params.toString()}`);
        }, 1200);
      } else {
        setError(t("stripePayment.error.unexpectedStatus"));
        setLoading(false);
      }
    },
    [stripe, elements, orderId, orderNumber, router, clearCart, t]
  );

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-black text-[var(--hm-text)]">{t("stripePayment.success.title")}</h2>
        <p className="text-sm text-[var(--hm-text-soft)]">
          {t("stripePayment.success.redirect")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: {
            applePay: "auto",
            googlePay: "auto",
            link: "auto",         // Stripe Link activé (paiement 1-clic, fidélise les
                                  // clients récurrents en sauvant CB + adresse côté
                                  // Stripe — RGPD compliant). Demande Kaan 2026-05-26.
          },
          defaultValues: {
            billingDetails: {
              name:  userName  || undefined,
              email: userEmail || undefined,
            },
          },
        }}
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className={`btn-primary w-full gap-2 py-4 text-sm mt-2
          ${loading || !stripe ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <Lock size={14} />
        {loading
          ? t("stripePayment.button.processing")
          : totalTTC
          ? `${t("stripePayment.button.pay")} ${formatPrice(totalTTC)}`
          : t("stripePayment.button.payShort")}
      </button>

      <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
        🔒 {t("stripePayment.footer.ssl")}
      </p>
    </form>
  );
}

// ─── Wrapper complet (lit les params URL, charge Elements) ────────────────────

export default function StripePayment() {
  const t             = useT();
  const searchParams  = useSearchParams();
  const clientSecret  = searchParams.get("clientSecret");
  const orderId       = searchParams.get("orderId")     ?? "";
  const orderNumber   = searchParams.get("orderNumber") ?? "";
  const totalParam    = searchParams.get("total");
  const totalTTC      = totalParam ? parseFloat(totalParam) : null;

  // Récupère les infos du compte connecté (Google OAuth) pour pré-remplir Stripe
  const [userName,  setUserName]  = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // user_metadata contient full_name (Google) ou name (autres providers)
      setUserName(
        user.user_metadata?.full_name ??
        user.user_metadata?.name       ??
        ""
      );
      setUserEmail(user.email ?? "");
    });
  }, []);

  if (!clientSecret) {
    return (
      <div className="pt-24 pb-20 text-center">
        <p className="text-[#555555] mb-4">{t("stripePayment.invalidSession")}</p>
        <Link href="/checkout" className="btn-outline text-sm">
          {t("stripePayment.backToCart")}
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-lg">
        <div className="mb-8">
          <Link
            href="/checkout"
            className="flex items-center gap-1 text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            {t("stripePayment.back")}
          </Link>
          <h1 className="text-2xl font-black text-[var(--hm-text)]">{t("stripePayment.heading")}</h1>
          <p className="text-sm text-[var(--hm-text-soft)] mt-1">
            {t("stripePayment.subheading")}
          </p>
        </div>

        <div className="p-6 bg-white border border-[var(--hm-line)] rounded-xl shadow-[var(--hm-shadow-sm)]">
          <div className="flex items-center gap-2 mb-6 pb-5 border-b border-[var(--hm-line)]">
            <Lock size={12} className="text-green-500" />
            <span className="text-[11px] text-[var(--hm-text-muted)]">
              {t("stripePayment.secureConnection")}
            </span>
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: STRIPE_APPEARANCE,
              locale: "fr",
            }}
          >
            <PaymentForm
              orderId={orderId}
              orderNumber={orderNumber}
              totalTTC={totalTTC}
              userName={userName}
              userEmail={userEmail}
            />
          </Elements>
        </div>

        {orderId && (
          <p className="text-center text-[10px] text-[var(--hm-text-muted)] mt-4">
            {t("stripePayment.orderRef")} {orderId}
          </p>
        )}
      </div>
    </div>
  );
}
