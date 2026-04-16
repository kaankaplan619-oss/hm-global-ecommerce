import Stripe from "stripe";

// ─── Stripe Server Instance ───────────────────────────────────────────────────

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  return stripeInstance;
}

// ─── Create Payment Intent ────────────────────────────────────────────────────

export async function createPaymentIntent(params: {
  amountTTC: number; // en euros (ex: 59.90)
  orderNumber: string;
  userEmail: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(params.amountTTC * 100), // centimes
    currency: "eur",
    receipt_email: params.userEmail,
    metadata: {
      orderNumber: params.orderNumber,
      ...params.metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

// ─── Refund ───────────────────────────────────────────────────────────────────

export async function refundPayment(params: {
  paymentIntentId: string;
  amountTTC?: number; // partiel si précisé
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}) {
  const stripe = getStripe();

  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    ...(params.amountTTC
      ? { amount: Math.round(params.amountTTC * 100) }
      : {}),
    reason: params.reason ?? "requested_by_customer",
  });

  return refund;
}

// ─── Verify Webhook ───────────────────────────────────────────────────────────

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }

  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ─── Client-side publishable key ─────────────────────────────────────────────

export function getPublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
  return key;
}
