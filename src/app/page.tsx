import Hero from "@/components/Hero";
import Work from "@/components/Work";
import About from "@/components/About";
import ResumePreview from "@/components/ResumePreview";
import Services from "@/components/Services";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main id="main-content" className="relative">
      <Hero />
      <Work />
      <About />
      <ResumePreview />
      <Services />
      <ContactCTA />
      <Footer />
    </main>
  );
}
