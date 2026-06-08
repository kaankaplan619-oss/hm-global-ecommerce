import type { Metadata } from "next";
import BackLink from "@/components/ui/BackLink";
import BusinessCardPageClient from "./BusinessCardPageClient";

export const metadata: Metadata = {
  title: "Cartes de visite personnalisées — Impression | HM Global",
  description:
    "Commandez vos cartes de visite 85×55 mm en ligne. Papier 350 g/m², finition mate, brillante ou premium, coins standard ou arrondis. Déposez votre fichier PDF ou PNG et recevez votre BAT avant impression.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartesDeVisitePage() {
  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">

        {/* ── Fil d'Ariane ─────────────────────────────────────────────── */}
        <BackLink href="/impression" label="Retour au print" />

        {/* ── En-tête ──────────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="section-tag">Format 85×55 mm · Papier 350 g/m²</p>
          <h1 className="mb-3 text-3xl font-black text-[var(--hm-text)] md:text-4xl">
            Cartes de visite personnalisées
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            Déposez vos fichiers recto et verso (PDF, PNG ou JPG en haute résolution),
            choisissez votre finition et validez votre BAT.
            Production après validation, délai confirmé au devis.
          </p>
        </div>

        {/* ── Bandeau réassurance compact ───────────────────────────────── */}
        <div className="mb-10 flex flex-wrap gap-2">
          {[
            "🎨 PDF · PNG · JPG acceptés",
            "✅ BAT validé avant impression",
            "📦 Production après validation",
            "🖌️ Accompagnement PAO possible",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)]"
            >
              {item}
            </span>
          ))}
        </div>

        {/* ── Configurateur ─────────────────────────────────────────────── */}
        <BusinessCardPageClient />

      </div>
    </div>
  );
}
