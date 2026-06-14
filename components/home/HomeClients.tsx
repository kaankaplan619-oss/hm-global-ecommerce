"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * HomeClients — Mur de logos clients sur l'accueil (benchmark 2026-06-12 :
 * pattern n°3, Mistertee l'utilise avec McDonald's/Vinci). Réutilise les
 * logos clients réels déjà présents sur /realisations (public/images/clients).
 * Niveaux de gris au repos, couleur au survol — sobre et pro.
 */

const CLIENT_LOGOS = [
  { src: "/images/clients/prestige.jpg",   alt: "Prestige Bar à Vin" },
  { src: "/images/clients/miamm.jpg",      alt: "MiAMMi" },
  { src: "/images/clients/metem.jpg",      alt: "Metem" },
  { src: "/images/clients/ak-pro.jpg",     alt: "AK Pro" },
  { src: "/images/clients/doy-doy.jpg",    alt: "Doy Doy" },
  { src: "/images/clients/las-burger.jpg", alt: "Las Burger" },
  { src: "/images/clients/man-auto.jpg",   alt: "Man Auto" },
  { src: "/images/clients/r3m.jpg",        alt: "R3M" },
  { src: "/images/clients/serol.jpg",      alt: "Serol" },
] as const;

export default function HomeClients() {
  const t = useT();
  return (
    <section className="bg-white py-10 lg:py-12">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--hm-text-muted-2)" }}
          >
            {t("home.clients.heading")}
          </p>
          <Link
            href="/realisations"
            className="hidden items-center gap-1 text-xs font-bold text-[var(--hm-primary)] hover:underline sm:inline-flex"
          >
            {t("home.clients.seeProjects")} <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-3 items-center gap-x-6 gap-y-4 sm:grid-cols-5 lg:grid-cols-9">
          {CLIENT_LOGOS.map(({ src, alt }) => (
            <div
              key={src}
              className="flex h-14 items-center justify-center overflow-hidden rounded-xl border bg-white p-2 grayscale transition duration-300 hover:grayscale-0"
              style={{ borderColor: "rgba(45,35,64,0.06)" }}
              title={alt}
            >
              <Image
                src={src}
                alt={`${t("home.clients.logoAlt")} ${alt}`}
                width={96}
                height={48}
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
