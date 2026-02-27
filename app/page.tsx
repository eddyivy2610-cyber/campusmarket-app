import { Header } from "./components/header/Header";
import { Hero } from "./components/home/Hero";
import { ProductGrid } from "./components/home/ProductGrid";
import { Footer } from "./components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <Header />

      <div className="flex flex-col w-full">
        <Hero />
        <ProductGrid />
      </div>

      <Footer />
    </main>
  );
}
