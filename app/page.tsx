import { Header } from "./components/header/Header";
import { Hero } from "./components/home/Hero";
import { FeatureHighlights } from "./components/home/FeatureHighlights";
import { CategoryPreview } from "./components/home/CategoryPreview";
import { ProductGrid } from "./components/home/ProductGrid";
import { PromoBanner } from "./components/home/PromoBanner";
import { NewsBlog } from "./components/sections/NewsBlog";
import { FAQ } from "./components/sections/FAQ";
import { Footer } from "./components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <Header />

      <div className="flex flex-col w-full">
        <Hero />
        <FeatureHighlights />
        <CategoryPreview />
        <ProductGrid />
        <PromoBanner />

        {/* Retaining these sections but ensuring they have spacing */}
        <div className="py-12 bg-secondary/10">
          <NewsBlog />
        </div>
        <div className="py-12">
          <FAQ />
        </div>
      </div>

      <Footer />
    </main>
  );
}
