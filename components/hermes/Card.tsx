/**
 * components/hermes/Card.tsx — Carte sombre premium (surface Hermès OS).
 *
 * Server-safe. Variants `default` (subtle border) et `accent` (highlight rose).
 * Pas d'interaction interne.
 */

export default function Card({
  children,
  className = "",
  variant = "default",
}: {
  children:   React.ReactNode;
  className?: string;
  variant?:   "default" | "accent";
}) {
  const border =
    variant === "accent"
      ? "1px solid rgba(177,63,116,0.30)"
      : "1px solid rgba(255,255,255,0.08)";

  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background: "rgba(255,255,255,0.025)",
        border,
        backdropFilter: "blur(2px)",
      }}
    >
      {children}
    </div>
  );
}
