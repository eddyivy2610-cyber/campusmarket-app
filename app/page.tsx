"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Footer } from "./components/sections/Footer";
import { CATEGORIES } from "./data/products";

// Map emoji icons per category (matches CATEGORIES data)
const CAT_IMAGES: Record<string, string> = {
  Electronics:      "https://images.unsplash.com/photo-1517336715481-d1ad7eaf1c9c?w=400&q=80",
  Academics:        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80",
  Accomodation:     "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
  "Food & Provisions": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  Fashion:          "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=400&q=80",
  "Personal Care":  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80",
  "Sports & Fitness":"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
  Entertainment:    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
  Transport:        "https://images.unsplash.com/photo-1558981001-5864b3250a69?w=400&q=80",
  Services:         "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
};

export default function LandingPage() {
  const router = useRouter();
  const navLinksRef  = useRef<HTMLUListElement>(null);
  const carouselRef  = useRef<HTMLDivElement>(null);

  function toggleNav() {
    navLinksRef.current?.classList.toggle("lp-active");
  }

  function scrollCarousel(dir: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  }

  return (
    <>
      <style>{`
        .lp-body {
          color: #111;
          overflow-x: hidden;
          font-family: 'Poppins', sans-serif;
        }

        /* ── NAVBAR ──────────────────────── */
        .lp-nav {
          position: fixed;
          width: 100%;
          top: 0;
          padding: 15px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
        }

        .lp-logo {
          font-size: 20px;
          font-weight: 700;
          color: #FFD700;
          font-family: sans-serif;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
        }
        @media (min-width: 768px) {
          .lp-logo { font-size: 22px; }
        }

        .lp-nav-links {
          display: flex;
          gap: 25px;
          list-style: none;
          color: #fff;
        }

        .lp-nav-links li {
          cursor: pointer;
          transition: color 0.2s;
        }

        .lp-nav-links li:hover { color: #FFD700; }

        .lp-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .lp-hamburger span {
          display: block;
          width: 25px;
          height: 3px;
          background: #FFD700;
        }

        /* ── HERO ────────────────────────── */
        .lp-hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          color: #fff;
          position: relative;
        }

        .lp-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1586880244406-556ebe35f282') center/cover no-repeat;
          z-index: -2;
        }

        .lp-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          z-index: -1;
        }

        .lp-hero h1 {
          font-size: 48px;
          font-weight: 700;
        }

        .lp-hero span { color: #FFD700; }

        .lp-hero p {
          margin: 15px auto;
          max-width: 400px;
          font-size: 15px;
        }

        .lp-btn {
          padding: 12px 25px;
          background: #FFD700;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .lp-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
        }

        /* ── CATEGORIES SECTION ──────────── */
        .lp-categories {
          padding: 70px 20px;
          text-align: center;
          background: #f9f9f9;
        }

        .lp-categories h2 {
          margin-bottom: 6px;
          font-size: 28px;
          font-weight: 600;
        }

        .lp-categories .lp-sub {
          color: #777;
          font-size: 14px;
          margin-bottom: 36px;
        }

        /* Carousel wrapper — constrains width + holds fade pseudo-elements */
        .lp-carousel-wrap {
          position: relative;
          max-width: 960px;
          margin: 0 auto;
        }

        /* Fade overlays on left/right edges */
        .lp-carousel-wrap::before,
        .lp-carousel-wrap::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          z-index: 2;
          pointer-events: none;
        }

        .lp-carousel-wrap::before {
          left: 0;
          background: linear-gradient(to right, #f9f9f9, transparent);
        }

        .lp-carousel-wrap::after {
          right: 0;
          background: linear-gradient(to left, #f9f9f9, transparent);
        }

        /* Scrollable track */
        .lp-carousel-track {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 8px 12px 16px;
          scrollbar-width: none;
        }

        .lp-carousel-track::-webkit-scrollbar { display: none; }

        /* Category card */
        .lp-cat-card {
          flex: 0 0 180px;
          scroll-snap-align: start;
          border-radius: 14px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07);
          background: #fff;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }

        .lp-cat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.13);
        }

        .lp-cat-card img {
          width: 100%;
          height: 130px;
          object-fit: cover;
          display: block;
        }

        .lp-cat-info {
          padding: 10px 12px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lp-cat-icon {
          font-size: 18px;
          line-height: 1;
        }

        .lp-cat-name {
          font-size: 13px;
          font-weight: 600;
          color: #111;
          text-align: left;
        }

        /* Arrow buttons */
        .lp-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-60%);
          z-index: 5;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #e5e5e5;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #333;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }

        .lp-arrow:hover {
          background: #FFD700;
          border-color: #FFD700;
          color: #111;
          transform: translateY(-60%) scale(1.08);
        }

        .lp-arrow-left  { left: -18px; }
        .lp-arrow-right { right: -18px; }

        /* ── MOBILE ──────────────────────── */
        @media (max-width: 600px) {
          .lp-hero h1 { font-size: 32px; }
          .lp-hero p  { font-size: 14px; }

          .lp-nav-links {
            position: absolute;
            top: 60px;
            right: 0;
            background: #000;
            width: 100%;
            flex-direction: column;
            align-items: center;
            display: none;
            padding: 20px 0;
          }

          .lp-nav-links.lp-active { display: flex; }
          .lp-hamburger { display: flex; }

          .lp-arrow { display: none; }

          .lp-cat-card { flex: 0 0 148px; }
          .lp-cat-card img { height: 100px; }
        }
      `}</style>

      <div className="lp-body">

        {/* NAVBAR */}
        <nav className="lp-nav">
          <div className="lp-logo">Hive</div>

          <ul className="lp-nav-links" ref={navLinksRef}>
            <li onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</li>
            <li onClick={() => router.push("/about-us")}>About</li>
            <li onClick={() => router.push("/register")} className="font-semibold text-[#FFD700] hover:scale-105 transition-transform">Get Started</li>
          </ul>

          <button className="lp-hamburger" onClick={toggleNav} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div>
            <h1>Powering <span>Campus Commerce</span></h1>
            <p>Buy, sell, and discover everything within your campus ecosystem.</p>
            <button className="lp-btn" onClick={() => router.push("/home")}>
              Explore
            </button>
          </div>
        </section>

        {/* FEATURED CATEGORIES */}
        <section className="lp-categories">
          <h2>Featured Categories</h2>
          <p className="lp-sub">Everything you need, all in one place</p>

          <div className="lp-carousel-wrap">
            {/* Left arrow */}
            <button
              className="lp-arrow lp-arrow-left"
              onClick={() => scrollCarousel("left")}
              aria-label="Scroll left"
            >
              &#8249;
            </button>

            {/* Scrollable track */}
            <div className="lp-carousel-track" ref={carouselRef}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="lp-cat-card"
                  onClick={() => router.push(cat.href || `/home?category=${cat.name}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && router.push(cat.href || `/home?category=${cat.name}`)}
                >
                  <img
                    src={CAT_IMAGES[cat.name] || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80"}
                    alt=""
                  />
                  <div className="lp-cat-info">
                    <span className="lp-cat-name">{cat.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button
              className="lp-arrow lp-arrow-right"
              onClick={() => scrollCarousel("right")}
              aria-label="Scroll right"
            >
              &#8250;
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <Footer />

      </div>
    </>
  );
}
