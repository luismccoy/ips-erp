import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustLogos from './components/TrustLogos';
import Challenges from './components/Challenges';
import AISection from './components/AISection';
import RoleSection from './components/RoleSection';
import ComplianceSection from './components/ComplianceSection';
import MobileAppSection from './components/MobileAppSection';
import StoriesSection from './components/StoriesSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

/**
 * IPS-ERP Production Landing Page
 * 
 * Design Philosophy:
 * - Enterprise healthcare aesthetic (not startup/AI generic)
 * - Colombian home healthcare focus (not hospital imagery)
 * - "Partner, Not Vendor" positioning
 * - Real stats and social proof
 * 
 * Color Palette:
 * - Primary: #1565C0 (Deep Blue - trust, professionalism)
 * - Secondary: #00897B (Teal - healthcare, growth)
 * - Accent: #FF6F00 (Warm Orange - CTAs)
 * - Text: #212121 (near-black for readability)
 * - Muted: #616161 (body text)
 * - Background: #FFFFFF, #F8FAFB (alt sections)
 * 
 * Typography:
 * - Font Family: Inter (Google Fonts)
 * - Headings: 600-700 weight
 * - Body: 400 weight
 */

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans antialiased text-gray-800">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustLogos />
        <Challenges />
        <AISection />
        <RoleSection />
        <ComplianceSection />
        <MobileAppSection />
        <StoriesSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;
