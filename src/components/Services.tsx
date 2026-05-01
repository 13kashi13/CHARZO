import React from 'react';
import { GlowButton } from './GlowButton';

const services = [
  {
    number: '01',
    title: 'Fast Charge',
    description: 'Open CHARZO, drop your pin, and a van is dispatched instantly. DC fast charging gets you back on the road in under an hour.',
    features: ['Instant dispatch', 'Live van tracking', '₹22 per kWh', 'All EV types'],
    tag: '₹22 / kWh',
  },
  {
    number: '02',
    title: 'Overnight Plan',
    description: 'Schedule a charge for the night. Our van arrives at your location, charges your EV while you sleep, and you wake up to 100%.',
    features: ['Advance booking', 'Flexible slots', '₹18 per kWh', 'Recurring plans'],
    tag: '₹18 / kWh',
  },
  {
    number: '03',
    title: 'Fleet Solutions',
    description: 'Running delivery EVs or a corporate fleet? CHARZO handles bulk charging with priority dispatch, a fleet dashboard, and dedicated support.',
    features: ['Bulk pricing', 'Priority dispatch', 'Fleet dashboard', 'Dedicated manager'],
    tag: 'For Business',
  },
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-[#080808] relative overflow-hidden">
      {/* CHARZO watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[clamp(80px,18vw,200px)] font-black text-white/[0.025] tracking-[-0.05em] leading-none">CHARZO</span>
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5a0] mb-4">Services</p>
            <h2 className="display-md text-white">
              One platform.<br />Every need.
            </h2>
          </div>
          <GlowButton href="#contact" height={44} fontSize={14} className="px-6 self-start lg:self-auto">
            Get Started Today
          </GlowButton>
        </div>

        {/* 3D Service cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="card-3d-parent">
              <div className="card-3d">

                {/* Floating badge — top right */}
                <div className="card-3d-badge">
                  <span className="card-3d-badge-num">{s.number}</span>
                  <span className="card-3d-badge-label">{s.tag}</span>
                </div>

                {/* Content panel */}
                <div className="card-3d-content">
                  <h3 className="card-3d-title">{s.title}</h3>
                  <p className="card-3d-body">{s.description}</p>

                  {/* Feature list */}
                  <ul className="card-3d-features">
                    {s.features.map((f, j) => (
                      <li key={j}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <circle cx="5" cy="5" r="4" stroke="#00e5a0" strokeWidth="1"/>
                          <path d="M3 5l1.5 1.5L7 3.5" stroke="#00e5a0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a href="#contact" className="card-3d-cta">Request this service</a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
