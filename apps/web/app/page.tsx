import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { Features } from "@/components/landing/Features";
import { DemoVisual } from "@/components/landing/DemoVisual";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTAFinal } from "@/components/landing/CTAFinal";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <SocialProof />
      <ProblemSolution />
      <Features />
      <DemoVisual />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTAFinal />
      <Footer />
    </main>
  );
}
