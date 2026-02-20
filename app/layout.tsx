import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque, Quicksand, Inter, Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { SavedProvider } from "./context/SavedContext";
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
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${quicksand.variable} ${inter.variable} ${montserrat.variable} ${poppins.variable} antialiased transition-colors duration-300 font-sans flex flex-col min-h-screen`}>
        <ThemeProvider>
          <SavedProvider>
            <SmoothScroll>
              {children}
              <ScrollToTop />
              <CustomerCareButton />
            </SmoothScroll>
          </SavedProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
