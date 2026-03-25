import { Hero } from "./components/home/Hero";
import { PRODUCTS } from "./data/products";
import { CategoriesSidebar } from "./components/home/CategoriesSidebar";
import { ProductGrid } from "./components/home/ProductGrid";
import { QuickActions } from "./components/home/QuickActions";
import { Footer } from "./components/sections/Footer";
import { RecommendedCarousel } from "./components/home/RecommendedCarousel";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf7ef] dark:bg-background text-foreground selection:bg-primary/20">
        <div className="max-w-[1780px] mx-auto px-4 md:px-8 overflow-visible">

          <div className="flex gap-5 lg:gap-6 items-start overflow-visible">
            <div className="hidden lg:block pt-4 sticky top-[56px] self-start pl-1 md:pl-2 z-[300]">
              <CategoriesSidebar />
            </div>

            <div className="flex-1 min-w-0 flex flex-col relative z-10">
              <div className="pt-4 md:pt-6">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
                  <Hero />
                  <div className="hidden lg:block self-start mt-2">
                    <QuickActions />
                  </div>
                </div>
              </div>
              <RecommendedCarousel products={PRODUCTS} />

              {/* Catalogue */}
              <section className="w-full pt-2 pb-8 md:pt-3 md:pb-10">
                <ProductGrid />
              </section>
            </div>
          </div>
        </div>

      <Footer />
    </div>
  );
}
