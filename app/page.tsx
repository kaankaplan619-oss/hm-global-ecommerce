import Hero from "../components/home/Hero";
import ReviewsBand from "../components/home/ReviewsBand";
import BestSellers from "../components/home/BestSellers";
import CategorySection from "../components/home/CategorySection";
import TechniqueComparison from "../components/home/TechniqueComparison";
import ProcessSection from "../components/home/ProcessSection";
import ImpressionSection from "../components/home/ImpressionSection";
import OtherServices from "../components/home/OtherServices";
import TrustBand from "../components/home/TrustBand";
import CTASection from "../components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ReviewsBand />
      <BestSellers />
      <TechniqueComparison />
      <CategorySection />
      <ProcessSection />
      <ImpressionSection />
      <OtherServices />
      <TrustBand />
      <CTASection />
    </>
  );
}
