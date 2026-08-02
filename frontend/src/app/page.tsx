"use client";

import { HeroSection } from '../components/layout/HeroSection';
import { SocialProof } from '../components/layout/SocialProof';
import { CompetitiveComparision } from '../components/layout/CompetitiveComparision';
import { SimpleWorkflow } from '../components/layout/SimpleWorkflow';
import { Banner } from '../components/layout/Banner';
import { Footer } from '../components/layout/Footer';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#030712] text-zinc-100 selection:bg-[#85DABE] selection:text-[#030712]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-50 right-[10%] w-100 h-100 bg-[radial-gradient(circle,rgba(133,218,190,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
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