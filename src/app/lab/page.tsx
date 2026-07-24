import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Lab — AI Playground | John Carman",
  description:
    "A playground of interactive AI tools and design-system experiments — Brand-in-a-Day OS, Style Guide That Talks Back, Campaign Factory, and Atelier — each labeled by how far along it is.",
  alternates: { canonical: "/lab" },
  openGraph: {
    title: "AI and Creative Systems | John Carman",
    description:
      "AI-enabled creative systems for exploration, operations, and brand governance. Interactive demos of each.",
    url: "/lab",
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
