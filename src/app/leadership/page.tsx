import type { Metadata } from "next";
import LeadershipPage from "@/components/LeadershipPage";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Creative Leadership | John Carman",
  description:
    "Creative leadership built inside complex organizations: enterprise brand transformation, integrated campaigns, creative operations, team leadership, and AI-enabled workflow improvement.",
  alternates: { canonical: "/leadership" },
  openGraph: {
    title: "Creative Leadership | John Carman",
    description:
      "Enterprise brand transformation, creative operations, and team leadership from Creative Director John Carman.",
    url: "/leadership",
    type: "website",
  },
};

export default function Page() {
  return (
    <main id="main-content" className="relative">
      <LeadershipPage />
      <Footer />
    </main>
  );
}
