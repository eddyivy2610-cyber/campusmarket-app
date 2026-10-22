import "@/lib/env";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { SavedProvider } from "./context/SavedContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { CampusProvider } from "./context/CampusContext";
import { FloatingActions } from "./components/locations/FloatingActions";
import { SmoothScroll } from "./components/common/SmoothScroll";
import { LayoutWrapper } from "./components/common/LayoutWrapper";

export const metadata: Metadata = {
  title: "Campus Hive 2.0 — Aspire Elevation",
  description: "Student-first hybrid marketplace connecting university students, student entrepreneurs, and approved local businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = {
    "--font-poppins": "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-plus-jakarta": "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-geist-sans": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-geist-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    "--font-bricolage": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-quicksand": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-inter": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    "--font-montserrat": "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  } as React.CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        style={{ ...fontVars }}
        className="antialiased transition-colors duration-300 font-sans flex flex-col min-h-screen"
      >
        <ThemeProvider>
          <CampusProvider>
            <AuthProvider>
              <SocketProvider>
                <SavedProvider>
                  <SmoothScroll>
                    <LayoutWrapper>
                      {children}
                    </LayoutWrapper>
                    <FloatingActions />
                  </SmoothScroll>
                </SavedProvider>
              </SocketProvider>
            </AuthProvider>
          </CampusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
