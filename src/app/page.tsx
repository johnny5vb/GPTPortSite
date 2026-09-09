import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Manifesto from "@/components/Manifesto";
import Work from "@/components/Work";
import Showpiece from "@/components/Showpiece";
import AISystemsTeaser from "@/components/AISystemsTeaser";
import About from "@/components/About";
import ResumePreview from "@/components/ResumePreview";
import Services from "@/components/Services";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main id="main-content" className="relative">
      <Hero />
      <Intro />
      <Manifesto />
      <Work />
      <Showpiece />
      <AISystemsTeaser />
      <About />
      <ResumePreview />
      <Services />
      <ContactCTA />
      <Footer />
    </main>
  );
}
