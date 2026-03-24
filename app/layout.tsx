import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { SavedProvider } from "./context/SavedContext";
import { AuthProvider } from "./context/AuthContext";
import { FloatingActions } from "./components/locations/FloatingActions";
import { SmoothScroll } from "./components/common/SmoothScroll";
import { LayoutWrapper } from "./components/common/LayoutWrapper";
import { Poppins } from "next/font/google";

const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Campus Hive",
  description: "Your Campus, Your Vibe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = {
    "--font-geist-sans": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-geist-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    "--font-bricolage": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-quicksand": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-inter": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-montserrat": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  } as React.CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{ ...fontVars, background: "#ffffff" }}
        className={`${poppinsFont.variable} antialiased transition-colors duration-300 font-sans flex flex-col min-h-screen`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SavedProvider>
              <SmoothScroll>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
                <FloatingActions />
              </SmoothScroll>
            </SavedProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
