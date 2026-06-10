import type { Metadata } from "next";
import PrintMockupPreview from "@/components/print/PrintMockupPreview";
import CardSituationPreview from "@/components/print/CardSituationPreview";
import { PRINT_MOCKUP_TEMPLATES } from "@/data/printMockupTemplates";

export const metadata: Metadata = {
  title: "Calibrage scène main (dev)",
  robots: { index: false, follow: false },
};

/** Page DEV temporaire — calibrage printArea de la scène carte en main.
 *  Design de test = logo MiAMM (jaune vif, bords nets) pour juger le calage. */
export default function CalibrageMainPage() {
  const hand = PRINT_MOCKUP_TEMPLATES.find((t) => t.id === "business-card-hand-01")!;
  return (
    <div className="container pb-20 pt-28">
      <h1 className="mb-6 text-2xl font-semibold text-[var(--hm-text)]">Calibrage — carte en main</h1>
      <div className="max-w-3xl">
        <PrintMockupPreview
          sceneImage={hand.sceneImage}
          sceneWidth={hand.sceneWidth!}
          sceneHeight={hand.sceneHeight!}
          printArea={hand.printArea}
          clientDesignUrl="/images/clients/miamm.jpg"
          whiteCardOverlay
          occlusionPatch={hand.occlusionPatch}
          alt="calibrage"
        />
      </div>
      <h2 className="mb-4 mt-10 text-xl font-semibold text-[var(--hm-text)]">
        CardSituationPreview (composant du configurateur)
      </h2>
      <div className="max-w-3xl">
        <CardSituationPreview
          frontUrl="/images/clients/miamm.jpg"
          backUrl="/images/clients/r3m.jpg"
        />
      </div>
    </div>
  );
}
