import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, FileText, Image as ImageIcon, CreditCard, Frame, BookOpen,
  Palette, ShieldCheck, Brush, Package, MapPin,
} from "lucide-react";
import { PRINT_CATALOGUE, printSpecImage, printConfigHref } from "@/data/print-catalogue";

export const metadata: Metadata = {
  title: "Impression — Cartes de visite, Flyers, Affiches",
  description:
    "Imprimez vos cartes de visite, flyers, affiches, toiles et invitations. Formats normalisés, BAT validé avant production, livraison partout en France.",
};

// ─── Config catégories (en-têtes de section) ──────────────────────────────────

const PRINT_CATEGORIES = [
  {
    uid:         "business-cards",
    label:       "Cartes de visite",
    description: "Papier 350 g/m², finition mate, brillante ou premium. Format 85 × 55 mm.",
    icon:        CreditCard,
    iconBg:      "bg-[var(--hm-accent-soft-blue)]",
    iconColor:   "text-[var(--hm-blue)]",
    tag:         "Le basique premium",
  },
  {
    uid:         "flyer",
    label:       "Flyers & dépliants",
    description: "Du A6 au A4 — papier couché 170 g/m², impression recto ou recto-verso.",
    icon:        FileText,
    iconBg:      "bg-[var(--hm-accent-soft-purple)]",
    iconColor:   "text-[var(--hm-purple)]",
    tag:         "Diffusion terrain",
  },
  {
    uid:         "poster",
    label:       "Affiches & posters",
    description: "Du A3 au A2, papier 200 g/m², impression quadri haute définition.",
    icon:        ImageIcon,
    iconBg:      "bg-[var(--hm-accent-soft-rose)]",
    iconColor:   "text-[var(--hm-rose)]",
    tag:         "Grand format",
  },
  {
    uid:         "canvas",
    label:       "Toiles canvas",
    description: "Impression sur toile tendue, châssis bois FSC, format carré ou portrait.",
    icon:        Frame,
    iconBg:      "bg-[var(--hm-accent-soft-purple)]",
    iconColor:   "text-[var(--hm-purple)]",
    tag:         "Décoration & signalétique",
  },
  {
    uid:         "cards",
    label:       "Cartes & invitations",
    description: "A6, carré ou plié, 350 g/m² satiné, option dorure ou pelliculage.",
    icon:        BookOpen,
    iconBg:      "bg-[var(--hm-accent-soft-blue)]",
    iconColor:   "text-[var(--hm-blue)]",
    tag:         "Événements & cadeaux",
  },
] as const;

const REASSURANCE = [
  { icon: Palette,     label: "Fichiers PDF / PNG acceptés" },
  { icon: ShieldCheck, label: "BAT validé avant impression" },
  { icon: Brush,       label: "Accompagnement PAO possible" },
  { icon: Package,     label: "Production après validation" },
  { icon: MapPin,      label: "Livraison France via partenaires certifiés" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ImpressionPage() {
  const productsByCategory = Object.fromEntries(
    PRINT_CATALOGUE.map((block) => [block.uid, block.products]),
  );

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">

        {/* ── En-tête ──────────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="section-tag">Impression professionnelle</p>
          <h1
            className="mb-4 font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--hm-text)]"
            style={{ fontSize: "clamp(1.8rem, 3.4vw + 0.4rem, 3.2rem)" }}
          >
            Vos supports imprimés<br />
            <span style={{ color: "var(--hm-violet)" }}>cadrés avec vous avant production.</span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            Cartes de visite, flyers, affiches, toiles canvas — envoyez votre
            fichier PDF ou PNG, on valide le BAT avec vous puis on lance la production
            chez le partenaire d&apos;impression adapté au format et à la quantité.
          </p>
        </div>

        {/* ── Bandeau réassurance ───────────────────────────────────────── */}
        <div className="mb-12 flex flex-wrap gap-2">
          {REASSURANCE.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-semibold"
              style={{ color: "var(--hm-text-main)", border: "1px solid rgba(45,35,64,0.08)" }}
            >
              <Icon size={13} style={{ color: "var(--hm-cyan)" }} strokeWidth={1.8} />
              {label}
            </span>
          ))}
        </div>

        {/* ── Comment ça marche — 4 étapes (pack print 2026-06-12) ───────── */}
        <div className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { n: "1", t: "Envoyez votre fichier", d: "PDF ou PNG — ou créez votre visuel dans l'atelier en ligne." },
            { n: "2", t: "BAT validé avec vous", d: "Contrôle de fichier gratuit, bon à tirer avant toute production." },
            { n: "3", t: "Impression pro", d: "Papiers certifiés (350 g, couché 170 g…), quadri haute définition." },
            { n: "4", t: "Livraison France", d: "Production UE, suivi de commande dans votre espace client." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-xs font-black text-[var(--hm-primary)]">{s.n}</span>
              <p className="mt-2.5 text-[13px] font-bold text-[var(--hm-text)]">{s.t}</p>
              <p className="mt-1 text-[11.5px] leading-snug text-[var(--hm-text-soft)]">{s.d}</p>
            </div>
          ))}
        </div>

        {/* ── Vraies réalisations print HM Global (confiance) ────────────── */}
        <div className="mb-14">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.015em] text-[var(--hm-text)]">Imprimé pour de vrais clients</h2>
              <p className="text-xs text-[var(--hm-text-soft)]">Quelques commandes livrées par l&apos;agence — photos réelles, pas des mockups.</p>
            </div>
            <Link href="/realisations" className="hidden items-center gap-1 text-xs font-bold text-[var(--hm-primary)] hover:underline sm:inline-flex">
              Voir toutes les réalisations <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { src: "/images/realisations/foch-cartes.jpg",        alt: "Cartes de visite imprimées — client Foch",   label: "Cartes de visite" },
              { src: "/images/realisations/ncm-flyers.jpg",         alt: "Flyers imprimés — client NCM",                label: "Flyers" },
              { src: "/images/realisations/illico-panneau.jpg",     alt: "Panneau imprimé grand format — client Illico", label: "Affiches & panneaux" },
            ].map((r) => (
              <figure key={r.src} className="group relative overflow-hidden rounded-[1.4rem] border border-[var(--hm-line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.src} alt={r.alt} loading="lazy" decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <figcaption className="absolute bottom-2 left-2 rounded-full bg-white/92 px-3 py-1 text-[10px] font-bold text-[var(--hm-text)] backdrop-blur">
                  {r.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* ── Catégories ────────────────────────────────────────────────── */}
        <div className="space-y-16">
          {PRINT_CATEGORIES.map((cat) => {
            const Icon     = cat.icon;
            const products = productsByCategory[cat.uid] ?? [];
            if (products.length === 0) return null;

            return (
              <div key={cat.uid} id={cat.uid}>

                {/* En-tête catégorie */}
                <div className="mb-6 flex items-center gap-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cat.iconBg}`}>
                    <Icon size={16} className={cat.iconColor} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.015em] text-[var(--hm-text)]">{cat.label}</h2>
                    <p className="text-xs text-[var(--hm-text-soft)]">{cat.description}</p>
                  </div>
                  <div className="ml-auto h-[1px] flex-1 bg-[var(--hm-line)]" />
                  <span className="hidden rounded-full bg-[var(--hm-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--hm-text-muted)] sm:inline">
                    {cat.tag}
                  </span>
                </div>

                {/* Grille produits curés */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)] bg-white shadow-[0_12px_30px_rgba(63,45,88,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(177,63,116,0.20)] hover:shadow-[0_20px_42px_rgba(63,45,88,0.10)]"
                    >
                      {/* Overlay cliquable (toute la carte) */}
                      <Link
                        href={printConfigHref(product.id)}
                        aria-label={`Personnaliser ${product.name} ${product.sizeLabel}`}
                        className="absolute inset-0 z-10"
                      />

                      {/* Spec mockup cohérent (support à plat, taille annotée) */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--hm-surface)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={printSpecImage(product.id)}
                          alt={`${product.name} — ${product.sizeLabel}`}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                          decoding="async"
                        />
                        {product.badge && (
                          <span className="absolute left-3 top-3 rounded-full bg-[var(--hm-primary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[15px] font-semibold leading-tight text-[var(--hm-text)]">
                            {product.name}
                          </p>
                          <span className="shrink-0 rounded-full border border-[var(--hm-line)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--hm-text-soft)]">
                            {product.sizeLabel}
                          </span>
                        </div>

                        <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--hm-text-soft)]">
                          {product.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span
                            className="text-[13px] font-bold"
                            style={{ color: product.direct ? "var(--hm-primary)" : "var(--hm-text-muted)" }}
                          >
                            {product.priceLabel}
                          </span>
                        </div>

                        {/* CTA : cartes → configurateur live ; autres → devis */}
                        <Link
                          href={printConfigHref(product.id)}
                          className="relative z-20 mt-4 flex items-center justify-between rounded-xl border border-[var(--hm-primary)]/30 bg-[var(--hm-accent-soft-rose)] px-3.5 py-3 text-[12px] font-bold text-[var(--hm-primary)] transition-all group-hover:border-[var(--hm-primary)] group-hover:bg-[var(--hm-primary)] group-hover:text-white"
                        >
                          Personnaliser maintenant
                          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

        {/* ── CTA bas de page ───────────────────────────────────────────── */}
        <div
          className="mt-16 rounded-[1.8rem] p-8 text-center sm:p-12"
          style={{
            background: "linear-gradient(135deg, #f4f8fb 0%, #ffffff 50%, #faf3f7 100%)",
            border: "1px solid rgba(45,35,64,0.06)",
            boxShadow: "0 10px 32px rgba(45,35,64,0.06)",
          }}
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--hm-cyan)" }}>
            Besoin d&apos;un projet sur-mesure&nbsp;?
          </p>
          <h2
            className="mb-3 font-semibold leading-[1.08] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.4rem, 2.4vw + 0.4rem, 2rem)", color: "var(--hm-text-main)" }}
          >
            Textile + Print + Signalétique —{" "}
            <span style={{ color: "var(--hm-magenta)" }}>on gère tout</span>
          </h2>
          <p className="mb-7 max-w-xl mx-auto text-[14px] leading-[1.7]" style={{ color: "var(--hm-text-muted-2)" }}>
            Commande mixte, grand volume, adaptation logo ou projet complet :
            HM Global vous accompagne du fichier à la livraison.
          </p>
          <div className="flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Link href="/contact" className="btn-hm-magenta w-full sm:w-auto">
              Demander un devis global
              <ArrowRight size={15} />
            </Link>
            <Link href="/catalogue" className="btn-hm-violet-outline w-full sm:w-auto">
              Voir le textile
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
