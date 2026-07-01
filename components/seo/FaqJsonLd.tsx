/**
 * FaqJsonLd.tsx
 *
 * Données structurées schema.org "FAQPage" → éligible aux résultats enrichis
 * Google. Reçoit uniquement des questions/réponses réelles.
 */

import type { FaqItem } from "@/data/faq";

type Props = { id: string; items: FaqItem[] };

export default function FaqJsonLd({ id, items }: Props) {
  if (items.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": id,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
