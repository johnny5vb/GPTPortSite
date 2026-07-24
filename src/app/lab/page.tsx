import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI and Creative Systems | John Carman",
  description:
    "AI as a creative leadership and operations tool. Four interactive design-system concepts — Brand-in-a-Day OS, Style Guide That Talks Back, Campaign Factory, and Atelier — each clearly labeled by status.",
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
