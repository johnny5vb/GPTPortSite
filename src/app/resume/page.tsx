import type { Metadata } from "next";
import ResumePage from "@/components/ResumePage";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Résumé | John Carman, Creative Director",
  description:
    "Résumé of John Carman — Creative Director and Brand & Creative Operations Leader. 20 years across enterprise brand, campaigns, creative operations, and AI-enabled workflow.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Résumé | John Carman, Creative Director",
    description:
      "Creative Director and Brand & Creative Operations Leader — 20 years, mostly enterprise healthcare.",
    url: "/resume",
    type: "website",
  },
};

export default function Page() {
  return (
    <main id="main-content" className="relative">
      <ResumePage />
      <Footer />
    </main>
  );
}
