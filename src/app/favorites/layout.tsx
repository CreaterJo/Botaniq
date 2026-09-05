import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meine Favoriten | Botaniq",
  description: "Deine gespeicherten Pflanzen-Favoriten",
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
