import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Work from "@/components/Work";
import Showpiece from "@/components/Showpiece";
import StyleGuideTalksBack from "@/components/StyleGuideTalksBack";
import Services from "@/components/Services";
import About from "@/components/About";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main id="main-content" className="relative">
      <Hero />
      <Manifesto />
      <Work />
      <Showpiece />
      <StyleGuideTalksBack featured />
      <Services />
      <About />
      <ContactCTA />
      <Footer />
    </main>
  );
}
