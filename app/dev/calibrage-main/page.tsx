import type { Metadata } from "next";
import TestPdfCard from "./TestPdfCard";

export const metadata: Metadata = {
  title: "Calibrage scène main (dev)",
  robots: { index: false, follow: false },
};

/** Page DEV temporaire — validation de la scène carte en main avec un
 *  PDF réel (pipeline production complet). Validé par Kaan le 2026-06-10. */
export default function CalibrageMainPage() {
  return (
    <div className="container pb-20 pt-28">
      <h1 className="mb-6 text-2xl font-semibold text-[var(--hm-text)]">
        Carte en main — PDF réel (carte Miguel Gonçalves)
      </h1>
      <div className="max-w-3xl">
        <TestPdfCard />
      </div>
    </div>
  );
}
