import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Clock3, MapPin, Printer, ShieldCheck, Star } from "lucide-react";

const PROOF_POINTS = [
  "Validation fichier avant production",
  "Accompagnement humain à chaque étape",
  "Paiement sécurisé et parcours clair",
];

const STATS = [
  { value: "24h",  label: "pour un premier retour utile",     accent: "from-[var(--hm-primary)] to-[var(--hm-rose)]" },
  { value: "7-10j", label: "de production annoncée",           accent: "from-[var(--hm-purple)] to-[var(--hm-primary)]" },
  { value: "10+",  label: "pièces pour la livraison offerte",  accent: "from-[var(--hm-blue)] to-[var(--hm-purple)]" },
];

const SECTORS = ["Corporate", "Clubs", "Retail", "Événementiel"];

export default function Hero() {
  return (
    <section className="home-hero relative overflow-hidden pt-[var(--site-header-offset)]">

      {/* ── Fond dégradé + blobs de couleur marque ─────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(252,253,255,0.97) 0%, rgba(255,255,255,1) 32%, rgba(248,249,252,0.92) 100%)",
        }}
      />
      {/* Blob rose haut-gauche */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-52 -top-52 h-[700px] w-[700px]"
        style={{ background: "radial-gradient(circle, rgba(177,63,116,0.07) 0%, transparent 65%)" }}
      />
      {/* Blob violet bas-droite */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-[600px] w-[600px]"
        style={{ background: "radial-gradient(circle, rgba(76,47,111,0.06) 0%, transparent 65%)" }}
      />
      {/* Blob cyan milieu-droite */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px]"
        style={{ background: "radial-gradient(circle, rgba(110,193,223,0.05) 0%, transparent 65%)" }}
      />

      <div className="home-hero-shell container relative z-10 pb-14 pt-10 md:pb-18 md:pt-14 lg:pb-24">
        <div className="home-hero-grid grid items-center gap-10 xl:grid-cols-[0.96fr_1.04fr] xl:gap-14">
          <div className="max-w-[39rem]">

            {/* ── Kicker avec rating ─────────────────────────────────────── */}
            <div className="home-hero-kicker mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)] bg-white px-4 py-2 shadow-[0_6px_18px_rgba(63,45,88,0.05)]">
              <span className="h-2 w-2 rounded-full bg-[var(--hm-primary)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)] sm:tracking-[0.22em]">
                Textile personnalisé pour pros, clubs et marques
              </span>
              <span className="ml-1 flex items-center gap-1 border-l border-[var(--hm-line)] pl-2.5 text-[10px] font-bold text-amber-500">
                <Star size={9} fill="currentColor" />
                4.9
              </span>
            </div>

            {/* ── Titre ──────────────────────────────────────────────────── */}
            <h1 className="home-hero-title max-w-[12ch] text-[3.05rem] font-semibold leading-[0.94] tracking-[-0.05em] text-[var(--hm-text)] sm:text-[4.2rem] lg:text-[5rem] xl:text-[5.35rem]">
              Textile
              <span className="font-display ml-2 inline text-[var(--hm-primary)]">premium</span>
              <br />
              pour vos équipes
              <br />
              et votre image.
            </h1>

            {/* ── Accroche ───────────────────────────────────────────────── */}
            <p className="home-hero-copy mt-6 max-w-[35rem] text-[16px] leading-8 text-[var(--hm-text-soft)] md:text-[17px]">
              Broderie, DTF ou flex — HM Global gère tout, du fichier au colis.
              Un suivi humain, un BAT avant production, des délais tenus.
            </p>

            {/* ── CTAs ───────────────────────────────────────────────────── */}
            <div className="home-hero-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/catalogue"
                className="btn-primary w-full justify-center gap-2 px-7 py-4 text-[0.82rem] shadow-[0_10px_28px_rgba(177,63,116,0.28)] hover:shadow-[0_14px_36px_rgba(177,63,116,0.35)] sm:w-auto"
              >
                Commander du textile
                <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="btn-outline w-full justify-center gap-2 px-6 py-4 text-[0.82rem] sm:w-auto">
                Demander un devis gratuit
              </Link>
            </div>

            {/* ── Micro-trust ────────────────────────────────────────────── */}
            <p className="mt-4 text-[11px] text-[var(--hm-text-muted)]">
              Livraison France entière · Paiement sécurisé · BAT fourni avant production
            </p>
            <Link
              href="/impression"
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-[var(--hm-text-soft)] transition hover:text-[var(--hm-primary)]"
            >
              <Printer size={11} />
              Aussi disponible : impression (flyers, affiches, cartes de visite)
            </Link>

            {/* ── Stats ──────────────────────────────────────────────────── */}
            <div className="home-hero-stats mt-8 grid gap-3 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-[1.4rem] border border-[var(--hm-line)] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(63,45,88,0.04)]"
                >
                  {/* Barre de couleur en haut */}
                  <div className={`absolute inset-x-0 top-0 h-[3px] rounded-t-full bg-gradient-to-r ${stat.accent}`} />
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--hm-text)]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--hm-text-soft)]">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* ── Engagements ────────────────────────────────────────────── */}
            <div className="home-hero-proof mt-8 border-t border-[rgba(63,45,88,0.08)] pt-5">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {PROOF_POINTS.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <BadgeCheck size={15} className="text-[var(--hm-primary)]" />
                    <span className="text-[12px] text-[var(--hm-text-soft)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Visuel droite ──────────────────────────────────────────────── */}
          <div className="home-hero-visual relative mx-auto w-full max-w-[48rem] xl:max-w-none xl:pl-4">
            <div className="absolute inset-x-6 top-10 bottom-12 rounded-[2.5rem] border border-[rgba(63,45,88,0.04)] bg-[linear-gradient(180deg,rgba(248,249,251,0.86),rgba(255,255,255,0.92))] sm:inset-x-10" />

            <div className="relative grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
              {/* ── Carte principale — hoodie ─────────────────────────────── */}
              <div className="rounded-[1.8rem] border border-[var(--hm-line)] bg-white p-4 shadow-[0_20px_44px_rgba(63,45,88,0.07)]">
                <div className="mb-4 flex items-center justify-between rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-muted)]">
                      Pièce signature
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--hm-text)]">
                      Hoodie brodé premium
                    </p>
                  </div>
                  <span className="rounded-full bg-[rgba(177,63,116,0.10)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-primary)]">
                    Broderie
                  </span>
                </div>

                <div className="relative aspect-[4/4.6] overflow-hidden rounded-[1.45rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,#f6f4f6_0%,#ffffff_100%)]">
                  <Image
                    src="/mockups/gildan-18500/noir-front.png"
                    alt="Hoodie noir brodé"
                    fill
                    priority
                    sizes="(min-width: 1024px) 28vw, 90vw"
                    className="object-contain p-4"
                  />
                  {/* Overlay info produit */}
                  <div className="absolute bottom-4 left-4 rounded-2xl border border-white/70 bg-white/88 px-4 py-3 shadow-[0_14px_30px_rgba(63,45,88,0.08)] backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-muted)]">
                      Base chaude
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--hm-text)]">
                      Coupe premium, rendu plus mode
                    </p>
                  </div>
                  {/* Badge rating */}
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 shadow-sm">
                    <Star size={9} className="text-amber-400" fill="currentColor" />
                    <span className="text-[10px] font-bold text-amber-700">4.9</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hm-text-muted)]">
                      À partir de
                    </p>
                    <p className="whitespace-nowrap text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--hm-primary)]">
                      49,90 €
                    </p>
                  </div>
                  <Link
                    href="/catalogue"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--hm-line)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--hm-text)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                  >
                    Voir la sélection
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* ── Colonne droite ────────────────────────────────────────── */}
              <div className="flex flex-col gap-4">
                {/* Carte t-shirt */}
                <div className="rounded-[1.8rem] border border-[var(--hm-line)] bg-white p-4 shadow-[0_16px_36px_rgba(63,45,88,0.06)]">
                  <div className="relative aspect-[1/1.04] overflow-hidden rounded-[1.3rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,#f7f8fa_0%,#ffffff_100%)]">
                    <Image
                      src="/mockups/bella-3001/noir-front.png"
                      alt="T-shirt noir personnalisé"
                      fill
                      sizes="(min-width: 1024px) 18vw, 44vw"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--hm-text)]">T-shirt noir</p>
                      <p className="text-[12px] text-[var(--hm-text-soft)]">Base simple et plus nette</p>
                    </div>
                    <span className="rounded-full bg-[rgba(76,47,111,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-purple)]">
                      DTF
                    </span>
                  </div>
                </div>

                {/* Carte dark — promesse */}
                <div
                  className="relative overflow-hidden rounded-[1.8rem] p-5 text-white shadow-[0_20px_52px_rgba(0,0,0,0.28)]"
                  style={{ background: "linear-gradient(135deg, #0f2535 0%, #1e0f3a 52%, #30101f 100%)" }}
                >
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0"
                    style={{ background: "radial-gradient(ellipse at 12% 18%, rgba(110,193,223,0.28) 0%, transparent 55%)" }} />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0"
                    style={{ background: "radial-gradient(ellipse at 90% 88%, rgba(177,63,116,0.32) 0%, transparent 50%)" }} />

                  <div className="relative flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                    <MapPin size={13} />
                    Production et suivi
                  </div>
                  <p className="relative mt-3 text-[1.6rem] font-semibold leading-[1.1] tracking-[-0.04em]">
                    Un rendu plus net,
                    <br />
                    <span style={{ color: "#ffbfd7" }}>un projet plus simple.</span>
                  </p>
                  <div className="relative mt-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock3 size={16} className="mt-0.5 shrink-0 text-[var(--hm-blue-light)]" />
                      <div>
                        <p className="text-sm font-semibold">Délai annoncé clairement</p>
                        <p className="text-[12px] leading-5 text-white/65">7 à 10 jours ouvrés après validation.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#ffbfd7]" />
                      <div>
                        <p className="text-sm font-semibold">BAT et contrôle fichier</p>
                        <p className="text-[12px] leading-5 text-white/65">Aucune mise en production sans votre accord.</p>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-[1.2rem] border border-white/[0.08]">
                      <div className="relative aspect-[2.3/1] bg-white/5">
                        <Image
                          src="/mockups/gildan-18500/noir-detail.png"
                          alt="Détail hoodie personnalisé"
                          fill
                          sizes="(min-width: 1024px) 18vw, 44vw"
                          className="object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Badge flottant secteurs ────────────────────────────────── */}
            <div className="hm-float absolute -left-1 bottom-8 hidden rounded-[1.25rem] border border-[var(--hm-line)] bg-white px-4 py-3 shadow-[0_12px_26px_rgba(63,45,88,0.06)] 2xl:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-muted)]">
                Secteurs servis
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SECTORS.map((sector) => (
                  <span
                    key={sector}
                    className="rounded-full bg-[var(--hm-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--hm-text-soft)]"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
