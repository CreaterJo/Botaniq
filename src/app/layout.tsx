import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PlantProvider } from "@/context/PlantContext";
import { CleaningProvider } from "@/context/CleaningContext";

// Verwende Inter statt Geist - ist standardmäßig verfügbar
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Botaniq - Deine Pflanzenreferenz",
  description: "Entdecke und pflege deine Pflanzen mit Botaniq",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${inter.variable} font-sans antialiased bg-brand-light`}
      >
        <PlantProvider>
          <CleaningProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </CleaningProvider>
        </PlantProvider>
      </body>
    </html>
  );
}