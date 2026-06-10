import Image from "next/image";

/**
 * ClientLogos — logos de clients réels (sélection préparée par Kaan,
 * pack PC 2026-06). La plupart de ces identités ont été créées ou
 * déclinées par HM Global : double preuve (clients + création de logos).
 */

const LOGOS = [
  { src: "/images/clients/miamm.jpg",     name: "MiAMM" },
  { src: "/images/clients/r3m.jpg",       name: "R3M" },
  { src: "/images/clients/metem.jpg",     name: "METEM" },
  { src: "/images/clients/prestige.jpg",  name: "Prestige Vins & Boissons" },
  { src: "/images/clients/doy-doy.jpg",   name: "Doy Doy" },
  { src: "/images/clients/ak-pro.jpg",    name: "AK Pro" },
  { src: "/images/clients/man-auto.jpg",  name: "Man Auto" },
  { src: "/images/clients/serol.jpg",     name: "Serol Carrelage" },
  { src: "/images/clients/las-burger.jpg", name: "L'As Burger" },
] as const;

export default function ClientLogos() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {LOGOS.map((l) => (
        <div
          key={l.src}
          className="flex items-center justify-center rounded-[1.2rem] border border-[var(--hm-line)] bg-white p-4"
          title={l.name}
        >
          <div className="relative h-14 w-full sm:h-16">
            <Image
              src={l.src}
              alt={`Logo ${l.name}`}
              fill
              sizes="(min-width:1024px) 18vw, 30vw"
              className="object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
