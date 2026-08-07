import CapabilitiesDeck from "@/components/CapabilitiesDeck";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Capabilities Deck — Carman Creative",
  shareTitle: "Carman Creative — Capabilities Deck",
  description:
    "Creative direction, accelerated by AI. Brand identity, web design, packaging, and AI-powered creative systems. Studio in Virginia Beach, Philadelphia, and Brooklyn.",
  path: "/capabilities",
  type: "website",
});

export default function Page() {
  return <CapabilitiesDeck />;
}
