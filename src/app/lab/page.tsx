import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The AI Lab — Carman Creative",
  description:
    "Four AI-native design systems built by Carman Creative. Brand-in-a-Day OS, Style Guide That Talks Back, Campaign Factory, and Atelier — each interactive, each in production with real teams.",
  openGraph: {
    title: "Carman Creative — The AI Lab",
    description:
      "Four AI-native design systems. Interactive demos of each.",
    type: "website",
  },
};

export default function Page() {
  return (
    <main id="main-content" className="relative">
      <LabPage />
      <Footer />
    </main>
  );
}
