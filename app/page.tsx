import { Header } from "./components/header/Header";
import { Hero } from "./components/home/Hero";
import { SubHeroCategories } from "./components/home/SubHeroCategories";
import { HomeSidebar } from "./components/home/HomeSidebar";
import { ProductGrid } from "./components/home/ProductGrid";
import { Footer } from "./components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-clip selection:bg-primary/20">
      <Header />

      <div className="flex flex-col w-full">
        <Hero />
        <SubHeroCategories />

        {/* Main 2-Column Content Area */}
        <section className="max-w-[1780px] mx-auto px-4 md:px-8 w-full py-8 md:py-10 flex gap-6 lg:gap-8 items-start">
          <HomeSidebar />
          <div className="flex-1 min-w-0">
            <ProductGrid />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
