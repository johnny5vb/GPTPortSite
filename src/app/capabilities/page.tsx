import type { Metadata } from "next";
import CapabilitiesDeck from "@/components/CapabilitiesDeck";

export const metadata: Metadata = {
  title: "Capabilities Deck — Carman Creative",
  description:
    "Creative direction, accelerated by AI. Brand identity, web design, packaging, and AI-powered creative systems. Studio in Virginia Beach, Philadelphia, and Brooklyn.",
  openGraph: {
    title: "Carman Creative — Capabilities Deck",
    description:
      "Creative direction, accelerated by AI. Studio in Virginia Beach, Philadelphia, and Brooklyn.",
    type: "website",
  },
};

export default function Page() {
  return <CapabilitiesDeck />;
}
