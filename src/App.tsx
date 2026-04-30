import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CharzoMap } from './components/CharzoMap';
import { UseCases } from './components/UseCases';
import { Services } from './components/Services';
import { HowItWorks } from './components/HowItWorks';
import { TrustSection } from './components/TrustSection';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <Hero />
      <Services />
      <CharzoMap />
      <HowItWorks />
      <UseCases />
      <TrustSection />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
