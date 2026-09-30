import { ClosingCta } from "@/components/marketing/ClosingCta";
import { Hero } from "@/components/marketing/Hero";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ProductSection } from "@/components/marketing/ProductSection";

export function LandingPage(): React.ReactElement {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <ProductSection />
        <PricingSection />
        <ClosingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
