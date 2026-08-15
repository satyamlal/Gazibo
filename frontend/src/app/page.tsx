"use client";

import { HeroSection } from '../components/layout/HeroSection';
import { SocialProof } from '../components/layout/SocialProof';
import { CompetitiveComparision } from '../components/layout/CompetitiveComparision';
import { SimpleWorkflow } from '../components/layout/SimpleWorkflow';
import { Banner } from '../components/layout/Banner';
import { Footer } from '../components/layout/Footer';

export default function HomePage() {
  return (
    <div className="relative min-h-screen g-bg g-text selection:bg-[#85DABE] selection:text-[#030712]">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at center, var(--ga-glow-blue) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-[200px] right-[10%] w-[400px] h-[400px]"
          style={{ background: "radial-gradient(circle, var(--ga-glow-teal) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-100" />
      </div>
      <div className="relative z-10">
        <HeroSection/>

        <SocialProof/>

        {/* Why Gazibo */}
        <CompetitiveComparision/>

        {/* How It Works */}
        <SimpleWorkflow/>

        <Banner/>
        <Footer/>
      </div>
    </div>
  );
}