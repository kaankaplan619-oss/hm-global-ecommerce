import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocalServicePage from "@/components/local/LocalServicePage";
import LocalServiceJsonLd from "@/components/seo/LocalServiceJsonLd";
import { getLocalServicePage } from "@/data/local-seo";

const SLUG = "textile-personnalise-strasbourg";
const data = getLocalServicePage(SLUG);

export const metadata: Metadata = {
  title: data?.metaTitle,
  description: data?.metaDescription,
  alternates: { canonical: `/${SLUG}` },
  openGraph: {
    title: data?.metaTitle,
    description: data?.metaDescription,
    url: `/${SLUG}`,
    type: "website",
  },
};

export default function TextilePersonnaliseStrasbourgPage() {
  if (!data) notFound();
  return (
    <>
      <LocalServiceJsonLd
        slug={data.slug}
        serviceType={data.serviceType}
        name={data.metaTitle}
        description={data.metaDescription}
        faq={data.faq}
      />
      <LocalServicePage data={data} />
    </>
  );
}
