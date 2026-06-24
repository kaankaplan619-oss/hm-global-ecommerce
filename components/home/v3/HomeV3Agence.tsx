import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { RoofArt, AlsaceArt, BatArt } from "@/components/illustrations/AgenceSteps";

/**
 * HomeV3Agence — bloc « L'agence » en bas de l'accueil.
 * Même style que le bloc Erasmus (demande Kaan) : en-tête + citation, puis 3
 * cartes ILLUSTRÉES (« notre façon de faire ») pour appuyer « on ne sous-traite
 * pas votre image, on la fabrique », puis les vraies photos d'atelier en bande.
 * Contenu factuel, traduit FR/EN/TR.
 */

const STEPS = [
  { Art: RoofArt, key: "point1" },
  { Art: AlsaceArt, key: "point2" },
  { Art: BatArt, key: "point3" },
] as const;

const PHOTOS = [
  { src: "/images/realisations/miammi-pose.jpg", altKey: "alt1", badge: true },
  { src: "/images/home/hm-atelier-mains-presse.jpg", altKey: "alt2", badge: false },
  { src: "/images/home/hm-atelier-production-textile.jpg", altKey: "alt3", badge: false },
] as const;

export default async function HomeV3Agence() {
  const t = await getT();

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="container">
        {/* En-tête */}
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
          <div className="max-w-2xl">
            <p className="section-tag">{t("home.agence.tag")}</p>
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--hm-text)] sm:text-4xl">
              {t("home.agence.title")}
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[var(--hm-text-soft)]">
              {t("home.agence.lead")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href="/a-propos" className="btn-primary justify-center gap-2">
              {t("home.agence.ctaDiscover")}
              <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="btn-outline justify-center">
              {t("home.agence.ctaProject")}
            </Link>
          </div>
        </div>

        {/* Citation */}
        <figure className="mt-8 flex gap-4 rounded-2xl bg-[var(--hm-accent-soft-rose)] p-5 sm:px-7 sm:py-6">
          <Quote size={22} className="shrink-0 text-[var(--hm-rose)]" aria-hidden="true" />
          <div>
            <blockquote className="text-[15px] italic leading-7 text-[var(--hm-text)] sm:text-base">
              {t("home.agence.quote")}
            </blockquote>
            <figcaption className="mt-1.5 text-[13px] not-italic text-[var(--hm-text-soft)]">
              {t("home.agence.signature")}
            </figcaption>
          </div>
        </figure>

        {/* Cartes illustrées — notre façon de faire */}
        <p className="mb-4 mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-rose)]">
          {t("home.agence.stepsHeading")}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ Art, key }) => (
            <div
              key={key}
              className="group rounded-[1.4rem] border border-[var(--hm-line)] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(63,45,88,0.08)]"
            >
              <div className="rounded-[1rem] bg-[var(--hm-surface)] p-4">
                <Art />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-[var(--hm-text)]">
                {t(`home.agence.${key}.title`)}
              </h3>
              <p className="mt-1 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                {t(`home.agence.${key}.text`)}
              </p>
            </div>
          ))}
        </div>

        {/* Bande photos atelier (réelles) */}
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {PHOTOS.map((p) => (
            <div
              key={p.src}
              className="group relative aspect-[4/3] overflow-hidden rounded-[1.2rem] border border-[var(--hm-line)]"
            >
              <Image
                src={p.src}
                alt={t(`home.agence.${p.altKey}`)}
                fill
                sizes="(min-width:1024px) 31vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              {p.badge ? (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--hm-rose)] shadow-sm">
                  {t("home.agence.badge")}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
