import { Hero } from "./components/home/Hero";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "./data/products";
import { CategoriesSidebar } from "./components/home/CategoriesSidebar";
import { ProductGrid } from "./components/home/ProductGrid";
import { QuickActions } from "./components/home/QuickActions";
import { Footer } from "./components/sections/Footer";
import { SubHeroCategories } from "./components/home/SubHeroCategories";

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
              <section className="w-full pt-4 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-5 bg-[#FFD700]/80 rounded-none shadow-sm" />
                  <h2 className="text-sm md:text-base font-bold text-black dark:text-foreground uppercase tracking-wider">
                    Recommended
                  </h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {PRODUCTS.slice(0, 16).map((product) => (
                    <Link
                      key={product.id}
                      href={`/listings/${product.id}`}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#efe3cf] dark:border-border/70 bg-white dark:bg-card shadow-[0_8px_18px_rgba(40,30,10,0.06)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
                    >
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </section>
              <SubHeroCategories />

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
