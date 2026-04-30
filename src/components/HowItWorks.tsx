import React from 'react';
import { GlowButton } from './GlowButton';

const steps = [
  {
    step: '01',
    title: 'Request',
    body: 'Open CHARZO on your phone or browser. Drop your pin, pick your EV type, confirm. Done in under 60 seconds.',
    detail: 'No app download required',
  },
  {
    step: '02',
    title: 'We Dispatch',
    body: 'The nearest CHARZO van is instantly assigned. Track it live on the map. Real-time ETA, no guessing.',
    detail: 'Avg. arrival: 25 minutes',
  },
  {
    step: '03',
    title: 'You Charge',
    body: 'Our certified technician arrives, plugs in, and handles everything. You get notified when it\'s done.',
    detail: 'Pay seamlessly after',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how" className="py-24 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5a0] mb-4">How It Works</p>
          <h2 className="display-md text-white max-w-lg">
            Three steps.<br />Full battery.
          </h2>
        </div>

        {/* Steps — horizontal timeline on desktop */}
        <div className="grid md:grid-cols-3 gap-0 relative">
          {/* Connector */}
          <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {steps.map((s, i) => (
            <div key={i} className="relative flex flex-col md:items-start p-6 md:p-8">
              {/* Step number */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center">
                    <span className="text-[#00e5a0] text-lg font-black">{s.step}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="md:hidden absolute top-1/2 left-full w-8 h-px bg-white/10 -translate-y-1/2" />
                  )}
                </div>
              </div>

              <h3 className="text-xl font-black text-white mb-3">{s.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed mb-4">{s.body}</p>
              <span className="text-[11px] font-semibold text-[#00e5a0] uppercase tracking-widest">{s.detail}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-white font-bold text-lg">Ready to try it?</p>
            <p className="text-white/30 text-sm mt-1">No app needed. Works right from this page.</p>
          </div>
          <GlowButton href="#contact" height={44} fontSize={14} className="px-7 shrink-0">
            <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
              <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="white"/>
            </svg>
            Get Charge Now · Arrives in ~25 min
          </GlowButton>
        </div>
      </div>
    </section>
  );
};
