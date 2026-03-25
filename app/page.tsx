"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const popularItems = [
  {
    title: "Wireless Headphones",
    description: "Perfect for study & music.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Campus Hoodie",
    description: "Comfort meets style.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Used Textbooks",
    description: "Affordable and essential.",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="bg-white text-[#111]">
      <nav
        className={`fixed left-0 top-0 z-50 flex w-full items-center justify-between px-5 py-4 text-white transition-all duration-300 md:px-[50px] md:py-5 ${
          isScrolled ? "bg-black" : "bg-black/40 backdrop-blur-md"
        }`}
      >
        <div className="text-2xl font-bold text-[#FFD700]">Campus Hive</div>
        <ul className="flex list-none gap-4 text-sm md:gap-8 md:text-base">
          <li className="cursor-pointer transition-colors hover:text-[#FFD700]">Home</li>
          <li className="cursor-pointer transition-colors hover:text-[#FFD700]">Shop</li>
          <li className="cursor-pointer transition-colors hover:text-[#FFD700]">About</li>
          <li className="cursor-pointer transition-colors hover:text-[#FFD700]">Contact</li>
        </ul>
      </nav>

      <section className="relative flex h-screen items-center justify-center px-5 text-center text-white">
        <div className="absolute inset-0 -z-20">
          <Image
            src="https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=2000&q=80"
            alt="Students engaging in campus commerce"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 to-black/85" />

        <div>
          <h1 className="mb-4 text-4xl font-bold md:text-[55px]">
            Powering <span className="text-[#FFD700]">Campus Commerce</span>
          </h1>
          <p className="mx-auto mb-6 max-w-[500px] opacity-85">
            Buy, sell, and discover everything within your campus ecosystem —
            fast, simple, and reliable.
          </p>
          <Link
            href="/listings"
            className="inline-block rounded-full bg-[#FFD700] px-7 py-3 font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_#FFD700]"
          >
            Explore Marketplace
          </Link>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-center md:px-[50px]">
        <h2 className="mb-10 text-3xl font-semibold md:text-[32px]">Popular on Campus</h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {popularItems.map((item) => (
            <article
              key={item.title}
              className="rounded-[15px] bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-2.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            >
              <div className="relative mb-4 h-52 overflow-hidden rounded-[10px]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
              <p className="text-sm opacity-70">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-black px-5 py-5 text-center text-white">
        <p>© 2026 Campus Hive</p>
      </footer>
    </div>
  );
}
