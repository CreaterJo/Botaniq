import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PlantProvider } from "@/context/PlantContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-brand-light`}
      >
        <PlantProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </PlantProvider>
      </body>
    </html>
  );
}
