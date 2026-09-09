import type { Metadata } from "next";
import CapabilitiesDeck from "@/components/CapabilitiesDeck";

export const metadata: Metadata = {
  title: "Capabilities Deck | John Carman, Carman Creative",
  description:
    "Carman Creative capabilities: brand, creative direction, campaigns, digital, and design systems.",
  alternates: { canonical: "/capabilities" },
  openGraph: {
    title: "Capabilities Deck | John Carman, Carman Creative",
    description:
      "Carman Creative capabilities: brand, creative direction, campaigns, digital, and design systems.",
    url: "/capabilities",
    type: "website",
  },
};

export default function Page() {
  return <CapabilitiesDeck />;
}
