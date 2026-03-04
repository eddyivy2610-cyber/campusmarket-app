import { Hero } from "./components/home/Hero";
import { SubHeroCategories } from "./components/home/SubHeroCategories";
import { CategoriesSidebar } from "./components/home/CategoriesSidebar";
import { ProductGrid } from "./components/home/ProductGrid";
import { Footer } from "./components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">

      <div className="max-w-[1780px] mx-auto px-4 md:px-8">

        <div className="flex gap-5 lg:gap-6 items-start">


          <div className="hidden lg:block pt-4 md:pt-6 sticky top-24 self-start">
            <CategoriesSidebar />
          </div>


          <div className="flex-1 min-w-0 flex flex-col">
            <Hero />
            <SubHeroCategories />

            {/* Catalogue */}
            <section className="w-full py-8 md:py-10">
              <ProductGrid />
            </section>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}