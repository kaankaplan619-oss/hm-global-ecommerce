/**
 * LocalServiceJsonLd.tsx
 *
 * Données structurées schema.org pour une page SEO locale :
 *  - "Service" (prestation rattachée au LocalBusiness HM Global, zone Alsace)
 *  - "FAQPage" (questions/réponses réelles → éligible aux résultats enrichis
 *    Google, que les concurrents locaux n'exploitent pas).
 *
 * Aucune donnée inventée : reçoit uniquement le contenu réel de data/local-seo.ts.
 */

import type { LocalServiceFAQ } from "@/data/local-seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr";

type Props = {
  slug: string;
  serviceType: string;
  name: string;
  description: string;
  faq: LocalServiceFAQ[];
};

export default function LocalServiceJsonLd({
  slug,
  serviceType,
  name,
  description,
  faq,
}: Props) {
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/${slug}/#service`,
    name,
    serviceType,
    description,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: [
      { "@type": "City", name: "Strasbourg" },
      { "@type": "AdministrativeArea", name: "Bas-Rhin" },
      { "@type": "AdministrativeArea", name: "Alsace" },
    ],
    url: `${SITE_URL}/${slug}`,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/${slug}/#faq`,
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
        />
      )}
    </>
  );
}
