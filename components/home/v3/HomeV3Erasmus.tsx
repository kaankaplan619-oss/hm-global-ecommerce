import Link from "next/link";
import { ArrowRight, GraduationCap, Building2 } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { AtelierIaArt, ImmersionArt, EuropeArt } from "@/components/illustrations/ErasmusActivities";

/**
 * HomeV3Erasmus — bloc « engagement Erasmus » sur l'accueil (demande Kaan).
 * Carte soignée sur fond blanc + texte validé (about.erasmus.* + /engagements).
 * PAS de photo (mineurs) ni de logo Erasmus+/UE officiel (marque protégée,
 * réservée aux bénéficiaires + mention légale — à intégrer seulement quand Kaan
 * fournit le kit officiel). Activités CLASSÉES depuis le SSD en illustrations
 * « on a fait ça » + CTA pour écoles/assos/entreprises voulant monter un échange.
 */

const ACTIVITIES = [
  { Art: AtelierIaArt, key: "act1" },
  { Art: ImmersionArt, key: "act2" },
  { Art: EuropeArt, key: "act3" },
] as const;

export default async function HomeV3Erasmus() {
  const t = await getT();

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="container">
        <div
          className="overflow-hidden rounded-[2rem] border border-[var(--hm-line)] p-7 shadow-[0_18px_48px_rgba(63,45,88,0.06)] sm:p-10 lg:p-12"
          style={{ backgroundImage: "linear-gradient(180deg, #f9edf3 0%, #ffffff 72%)" }}
        >
          {/* En-tête */}
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(177,63,116,0.25)] bg-white px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--hm-rose)] shadow-sm">
                <GraduationCap size={15} /> {t("home.erasmus.euBadge")}
              </span>
              <p className="section-tag">{t("home.erasmus.tag")}</p>
              <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--hm-text)] sm:text-4xl">
                {t("about.erasmus.title")}
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--hm-text-soft)]">
                {t("about.erasmus.textBefore")}{" "}
                <strong className="text-[var(--hm-text)]">{t("about.erasmus.highlight")}</strong>{" "}
                {t("about.erasmus.textAfter")}
              </p>
              <p className="mt-3 max-w-xl text-[14px] leading-7 text-[var(--hm-text-soft)]">
                {t("home.erasmus.euLine")}
              </p>
            </div>
            <Link href="/engagements" className="btn-primary gap-2 lg:mb-1">
              {t("about.erasmus.cta")}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Activités illustrées — « on a fait ça » */}
          <p className="mb-4 mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-rose)]">
            {t("home.erasmus.actsHeading")}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {ACTIVITIES.map(({ Art, key }) => (
              <div
                key={key}
                className="group rounded-[1.4rem] border border-[var(--hm-line)] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(63,45,88,0.08)]"
              >
                <div className="rounded-[1rem] bg-[var(--hm-surface)] p-4">
                  <Art />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-[var(--hm-text)]">
                  {t(`home.erasmus.${key}.title`)}
                </h3>
                <p className="mt-1 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                  {t(`home.erasmus.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          {/* Partenaires — logos à intégrer dès que Kaan fournit les fichiers */}
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-rose)]">
              {t("home.erasmus.partnersHeading")}
            </p>
            <p className="mt-1 text-[13px] text-[var(--hm-text-soft)]">
              {t("home.erasmus.partnersNote")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex h-14 w-28 items-center justify-center rounded-xl border border-dashed border-[var(--hm-line)] bg-white"
                  aria-hidden="true"
                >
                  <Building2 size={20} className="text-[var(--hm-text-muted)] opacity-40" />
                </div>
              ))}
            </div>
          </div>

          {/* CTA partenaires — écoles / assos / entreprises */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[var(--hm-line)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-[15px] font-semibold leading-6 text-[var(--hm-text)]">
              {t("home.erasmus.partnerLine")}
            </p>
            <Link
              href="/contact?sujet=erasmus"
              className="btn-primary w-full justify-center gap-2 sm:w-auto sm:shrink-0"
            >
              {t("home.erasmus.partnerCta")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
