import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import TechniqueComparison from "@/components/home/TechniqueComparison";
import ProcessSection from "@/components/home/ProcessSection";
import TrustSection from "@/components/home/TrustSection";
import OtherServices from "@/components/home/OtherServices";
import ReviewsSection from "@/components/home/ReviewsSection";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <TechniqueComparison />
      <ProcessSection />
      <TrustSection />
      <OtherServices />
      <ReviewsSection />
      <CTASection />
    </>
  );
}
