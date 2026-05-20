/**
 * components/hermes/PageHeader.tsx — Bandeau de titre des pages Hermès OS.
 *
 * Server-safe (pas de "use client"). Pas d'interaction, juste un layout texte
 * + slot `actions` pour boutons éventuels.
 */

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?:     string;
  title:        string;
  description?: string;
  actions?:     React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/45 mb-2">
            {eyebrow}
          </p>
        )}
        <h1
          className="text-white text-2xl sm:text-[28px] font-semibold tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[13.5px] leading-6 text-white/55 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
