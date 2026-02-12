import { Header } from "./components/header/Header";
import { HeroCarousel } from "./components/home/HeroCarousel";
import { CuratedListings } from "./components/home/CuratedListings";
import { HowItWorks } from "./components/sections/HowItWorks";
import { NewsBlog } from "./components/sections/NewsBlog";
import { FAQ } from "./components/sections/FAQ";
import { Footer } from "./components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <div className="flex flex-col items-center w-full">
        <div className="w-full">
          <HeroCarousel />
        </div>
        <div className="w-full">
          <CuratedListings />
        </div>
        <div className="w-full reveal">
          <HowItWorks />
        </div>
        <div className="w-full reveal">
          <NewsBlog />
        </div>
        <div className="w-full reveal">
          <FAQ />
        </div>
      </div>
      <Footer />
    </main>
  );
}
