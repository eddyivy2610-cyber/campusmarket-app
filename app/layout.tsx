import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque, Quicksand, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { ScrollToTop } from "./components/locations/ScrollToTop";
import { CustomerCareButton } from "./components/locations/CustomerCareButton";
import { SmoothScroll } from "./components/common/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Market",
  description: "Your Campus, Your Vibe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${quicksand.variable} ${inter.variable} ${montserrat.variable} antialiased transition-colors duration-300 font-sans`}>
        <ThemeProvider>
          <WishlistProvider>
            <CartProvider>
              <SmoothScroll>
                {children}
                <ScrollToTop />
                <CustomerCareButton />
              </SmoothScroll>
            </CartProvider>
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
