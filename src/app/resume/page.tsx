import type { Metadata } from "next";
import ResumePage from "@/components/ResumePage";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Résumé | John Carman",
  description:
    "Résumé of John Carman — creative direction, brand systems, and creative operations. 20 years across enterprise brand, campaigns, and design systems, most of it inside large healthcare organizations.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Résumé | John Carman",
    description:
      "Creative direction, brand systems, and creative operations — 20 years, mostly enterprise healthcare.",
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
