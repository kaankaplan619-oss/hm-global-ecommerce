import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { REALISATIONS } from "@/data/realisations";
import { getT } from "@/lib/i18n/server";

const PICK_IDS = ["prestige-polos", "miammi-fabrication", "exo-solar-vehicule", "hm-print"] as const;
const LAYOUTS = [
  "sm:col-span-2 lg:col-span-5",
  "lg:col-span-7",
  "lg:col-span-7",
  "sm:col-span-2 lg:col-span-5",
] as const;

export default async function HomeV3Proof() {
  const t = await getT();
  const projects = PICK_IDS.map((id) => REALISATIONS.find((project) => project.id === id)).filter(
    (project): project is NonNullable<typeof project> => Boolean(project),
  );

  return (
    <section className="bg-[var(--hm-surface)] py-14 sm:py-20">
      <div className="container">
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <h2 className="max-w-xl text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[var(--hm-text)] sm:text-5xl">
            {t("home.realisations.headingLead")} {t("home.realisations.headingHighlight")}
            {t("home.realisations.headingTail")}
          </h2>
          <div className="lg:pb-1">
            <p className="max-w-2xl text-sm leading-7 text-[var(--hm-text-soft)]">
              {t("home.realisations.subtitle")}
            </p>
            <Link href="/realisations" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--hm-blue)]">
              {t("home.realisations.viewAllCta")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {projects.map((project, index) => (
            <Link key={project.id} href="/realisations" className={`group ${LAYOUTS[index]}`}>
              <div className={`relative overflow-hidden rounded-[1.25rem] bg-white ${index === 1 || index === 2 ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
                <Image
                  src={project.image}
                  alt={project.alt}
                  fill
                  sizes="(min-width: 1024px) 56vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--hm-primary)]">
                    {project.sector}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[var(--hm-text)]">{project.title}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--hm-text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--hm-primary)]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
