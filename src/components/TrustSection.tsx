import React from 'react';
import ShapeGrid from './ShapeGrid';

const testimonials = [
  {
    quote: 'I was stuck on the expressway with 3% battery at 11 PM. CHARZO had a van at my location in under 20 minutes. Genuinely saved my night.',
    name: 'Rahul Sharma',
    role: 'EV Car Owner · Noida',
    initials: 'RS',
  },
  {
    quote: 'Booked a morning charge the night before. Van showed up right on time, charged my scooter while I had breakfast. This is how EV ownership should feel.',
    name: 'Ananya Kapoor',
    role: 'Electric Scooter · Delhi',
    initials: 'AK',
  },
  {
    quote: 'We manage a fleet of 18 delivery EVs. CHARZO cut our charging downtime by over 65%. The live tracking and scheduling dashboard is excellent.',
    name: 'Vikram Malhotra',
    role: 'Fleet Manager · Gurugram',
    initials: 'VM',
  },
];

export const TrustSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#080808] relative overflow-hidden">
      {/* CHARZO watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[clamp(80px,18vw,200px)] font-black text-white/[0.025] tracking-[-0.05em] leading-none">CHARZO</span>
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { value: '100+', label: 'Charges Done' },
            { value: '~25 min', label: 'Avg. Arrival' },
            { value: '24/7', label: 'Availability' },
            { value: '4.9★', label: 'Avg. Rating' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex flex-col gap-1">
              <span className="text-2xl font-black text-[#00e5a0]">{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5a0] mb-4">Real Users</p>
          <h2 className="display-md text-white max-w-lg">
            Delhi NCR trusts<br />CHARZO.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="lift rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col justify-between">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#00e5a0">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#00e5a0]/[0.07] border border-[#00e5a0]/20 rounded-full px-2.5 py-1">
                    <svg width="8" height="8" viewBox="0 0 22 22" fill="none">
                      <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/>
                    </svg>
                    <span className="text-[9px] font-bold text-[#00e5a0] uppercase tracking-widest">CHARZO</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/20 flex items-center justify-center text-[#00e5a0] text-xs font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{t.name}</p>
                  <p className="text-white/25 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coverage banner */}
        <div className="mt-10 rounded-2xl border border-[#00e5a0]/10 bg-[#00e5a0]/[0.03] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-[#00e5a0]" />
              <div className="ring-pulse absolute inset-0 rounded-full border border-[#00e5a0]" />
            </div>
            <p className="text-white font-semibold text-sm">
              Currently serving <span className="text-[#00e5a0]">Noida, Delhi & Gurugram</span>
            </p>
          </div>
          <p className="text-white/25 text-xs font-medium uppercase tracking-widest">Expanding to Mumbai & Bangalore Q3 2026</p>
        </div>
      </div>
    </section>
  );
};
