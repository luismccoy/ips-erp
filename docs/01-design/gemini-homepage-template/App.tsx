
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

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <TrustLogos />
        <Challenges />
        <AISection />
        <RoleSection />
        <ComplianceSection />
        <MobileAppSection />
        <FinalCTA />
        <StoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
