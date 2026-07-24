import type { Metadata } from "next";
import CapabilitiesDeck from "@/components/CapabilitiesDeck";

export const metadata: Metadata = {
  title: "Capabilities Deck | John Carman, Carman Creative",
  description:
    "Creative leadership and creative-systems capabilities: brand, digital, campaigns, and AI-enabled workflow. Based in Virginia Beach; available for remote and select hybrid work.",
  alternates: { canonical: "/capabilities" },
  openGraph: {
    title: "Capabilities Deck | John Carman, Carman Creative",
    description:
      "Creative leadership and creative-systems capabilities: brand, digital, campaigns, and AI-enabled workflow.",
    url: "/capabilities",
    type: "website",
  },
};

export default function Page() {
  return <CapabilitiesDeck />;
}
