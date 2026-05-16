import Link from "next/link";
import { ArrowRight, FolderKanban, ShoppingBag } from "lucide-react";

const PATHS = [
  {
    icon: ShoppingBag,
    title: "Commander directement",
    description:
      "Pour un besoin textile déjà clair : choisir le support, la technique, la quantité et passer à l’action rapidement.",
    points: [
      "Parcours simple pour les commandes textiles standards",
      "Sélection du produit, du marquage et de l’emplacement",
      "Bon point d’entrée pour convertir sans friction",
    ],
    href: "/catalogue",
    cta: "Aller au catalogue",
    primary: true,
  },
  {
    icon: FolderKanban,
    title: "Cadrer un projet sur mesure",
    description:
      "Pour les besoins plus techniques, mixtes ou stratégiques : HM Global reprend le sujet avec vous avant la production.",
    points: [
      "Volume, timing, design, signalétique ou besoin mixte",
      "Accompagnement utile si le projet dépasse le textile simple",
      "Devis construit à partir de votre contexte réel",
    ],
    href: "/contact",
    cta: "Demander un devis",
    primary: false,
  },
] as const;

export default function CTASection() {
  return (
    <section className="py-18 sm:py-24">
      <div className="container">
        <div
          className="relative overflow-hidden rounded-[2.2rem] text-white shadow-[0_32px_72px_rgba(0,0,0,0.22)]"
          style={{ background: "linear-gradient(135deg, #0f2535 0%, #1e0f3a 52%, #30101f 100%)" }}
        >
          {/* Lueur cyan — couleur logo en haut à gauche */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 10% 20%, rgba(110,193,223,0.22) 0%, transparent 50%)" }}
          />
          {/* Lueur rose — couleur logo en bas à droite */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 88% 88%, rgba(177,63,116,0.28) 0%, transparent 48%)" }}
          />
          {/* Lueur violet au centre */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 55% 50%, rgba(76,47,111,0.20) 0%, transparent 60%)" }}
          />

          {/* En-tête */}
          <div className="relative border-b border-white/[0.08] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--hm-rose)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                Dernière étape
              </p>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
              <div>
                <h2 className="max-w-[12ch] text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[4.2rem]">
                  Choisir le bon chemin
                  <br />
                  <span style={{ color: "#ffbfd7" }}>pour commander</span>
                  <br />
                  sereinement.
                </h2>
              </div>
              <p className="max-w-[37rem] text-[15px] leading-7 text-white/64">
                Une action directe pour les commandes claires, un accompagnement
                personnalisé pour les projets qui demandent du recul et de la précision.
              </p>
            </div>
          </div>

          {/* Cartes */}
          <div className="relative grid gap-px bg-white/[0.06] lg:grid-cols-2">
            {PATHS.map((path) => {
              const Icon = path.icon;
              return (
                <article key={path.title} className="bg-black/30 px-6 py-7 sm:px-8 transition-colors hover:bg-black/[0.16]">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        background: path.primary
                          ? "linear-gradient(135deg,rgba(177,63,116,0.25),rgba(177,63,116,0.08))"
                          : "rgba(255,255,255,0.06)",
                        border: path.primary ? "1px solid rgba(177,63,116,0.30)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Icon size={18} className={path.primary ? "text-[#ffbfd7]" : "text-white/60"} />
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                      style={{
                        background: path.primary ? "rgba(177,63,116,0.15)" : "rgba(255,255,255,0.07)",
                        color: path.primary ? "#ffbfd7" : "rgba(255,255,255,0.55)",
                        border: path.primary ? "1px solid rgba(177,63,116,0.25)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {path.primary ? "Commande simple" : "Projet accompagné"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-[1.7rem] font-semibold leading-[1.08] tracking-[-0.04em]">
                    {path.title}
                  </h3>
                  <p className="mt-3 max-w-[34rem] text-[14px] leading-7 text-white/58">
                    {path.description}
                  </p>

                  <div className="mt-5 grid gap-2.5">
                    {path.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-[13px] leading-6 text-white/72"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hm-rose)] opacity-70" />
                        {point}
                      </div>
                    ))}
                  </div>

                  <div className="mt-7">
                    <Link
                      href={path.href}
                      className={
                        path.primary
                          ? "btn-primary px-5 py-3 text-[0.78rem]"
                          : "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-[0.78rem] font-semibold text-white/80 transition hover:bg-white hover:text-[var(--hm-text)]"
                      }
                    >
                      {path.cta}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
