import { Header } from "../components/header/Header";
import { Hero } from "../components/hero/Hero";
import { Features } from "../components/hero/Features";
import { HowItWorks } from "../components/sections/HowItWorks";
import { NewsBlog } from "../components/sections/NewsBlog";
import { FAQ } from "../components/sections/FAQ";
import { Footer } from "../components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-white overflow-x-hidden">
      <Header />
      <div className="flex flex-col items-center w-full">
        <div className="w-full">
          <Hero />
        </div>
        <div className="w-full reveal">
          <Features />
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
