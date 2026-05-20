import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import HermesShell from "@/components/hermes/HermesShell";
import { checkHermesAccess } from "@/lib/hermes/access";

export const metadata: Metadata = {
  title: {
    default: "Hermès OS",
    template: "%s · Hermès OS",
  },
  description: "Cockpit interne HM Global — rapports IA, tâches, projets, mémoire.",
  robots: { index: false, follow: false },
};

export default async function HermesOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await checkHermesAccess();

  if (!access.allowed) {
    return <AccessDeniedScreen reason={access.reason} email={access.email} />;
  }

  return <HermesShell email={access.email}>{children}</HermesShell>;
}

// ── Refus d'accès ─────────────────────────────────────────────────────────────

function AccessDeniedScreen({
  reason,
  email,
}: {
  reason: "no_session" | "not_listed" | "not_configured" | undefined;
  email:  string | null;
}) {
  const isNoSession = reason === "no_session";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #1a1f2c 0%, #0c0e14 60%), linear-gradient(180deg, #0c0e14, #131720)",
        color: "#e8e6f0",
      }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background:  "rgba(255,255,255,0.025)",
          border:      "1px solid rgba(255,255,255,0.08)",
          boxShadow:   "0 24px 56px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(248,113,113,0.10)",
            border:     "1px solid rgba(248,113,113,0.28)",
            color:      "#fca5a5",
          }}
        >
          <ShieldAlert size={22} strokeWidth={1.8} />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-white mb-2">
          Accès Hermès OS refusé
        </h1>

        <p className="text-[13.5px] leading-6 text-white/60">
          {isNoSession
            ? "Tu dois être connecté pour accéder à ce cockpit interne."
            : reason === "not_configured"
              ? "La whitelist HERMES_OS_ALLOWED_EMAILS n'est pas configurée côté serveur. Ajoute-la dans les variables Vercel."
              : "Ton compte n'est pas autorisé à accéder à Hermès OS."}
        </p>

        {email && reason === "not_listed" && (
          <p className="mt-3 text-[12px] text-white/40">
            Session active : <span className="text-white/60">{email}</span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {isNoSession ? (
            <Link
              href="/connexion?redirect=%2Fhermes"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-[13px] font-medium transition"
              style={{
                background: "linear-gradient(135deg, #C13C8A 0%, #b13f74 100%)",
                color:      "#ffffff",
                boxShadow:  "0 8px 24px rgba(177,63,116,0.25)",
              }}
            >
              Se connecter
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-[13px] font-medium transition"
              style={{
                background: "rgba(255,255,255,0.06)",
                border:     "1px solid rgba(255,255,255,0.10)",
                color:      "#e8e6f0",
              }}
            >
              Retour au site
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
