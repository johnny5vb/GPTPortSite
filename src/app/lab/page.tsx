import LabPage from "@/components/LabPage";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The AI Lab — Carman Creative",
  shareTitle: "Carman Creative — The AI Lab",
  description:
    "Four AI-native design systems built by Carman Creative. Brand-in-a-Day OS, Style Guide That Talks Back, Campaign Factory, and Atelier — each interactive, each in production with real teams.",
  path: "/lab",
  type: "website",
});

export default function Page() {
  return (
    <main id="main-content" className="relative">
      <LabPage />
      <Footer />
    </main>
  );
}
