import React from 'react';
import Hero from './components/Hero';
import Challenges from './components/Challenges';
import Features from './components/Features';
import FinalCTA from './components/FinalCTA';

/**
 * IPS-ERP Homepage V3 - Production Landing Page
 * 
 * STRUCTURE (Best of V1 + V2):
 * 1. Hero - Real home care nurse photo (NOT blood samples)
 * 2. Challenges - 4 boxes with REAL images (Glosadas, Manuales, Planillas, Cumplimiento)
 * 3. Features - Tablet/phone mockup with LIVE Nurse Module screenshot
 * 4. FinalCTA - "Agendar Demo Gratuito" form (from V1 - MUST HAVE)
 * 
 * IMAGE REQUIREMENTS:
 * - All images must be HIGH-QUALITY and REAL (no AI-generated look)
 * - Sources: Unsplash, Pexels, or custom photography
 * - Sub-agent is researching images and will populate IMAGE_SOURCES.md
 * 
 * NEXT STEPS:
 * 1. Sub-agent completes image research
 * 2. Download and optimize images (WebP format)
 * 3. Replace all PLACEHOLDER_*_URL with actual image paths
 * 4. Capture real Nurse Module screenshot for Features section
 * 5. Test on localhost:8888
 * 6. Deploy to production
 */

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Real home care imagery */}
      <Hero />

      {/* Challenges Section - 4 boxes with real images */}
      <Challenges />

      {/* Features Section - Mobile compatibility with real product screenshot */}
      <Features />

      {/* Final CTA - "Agendar Demo Gratuito" (Critical for lead capture) */}
      <FinalCTA />
    </div>
  );
};

export default App;
