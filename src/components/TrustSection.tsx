import React from 'react';
import ShapeGrid from './ShapeGrid';

const testimonials = [
  {
    quote: 'I was stuck at a mall with 5% battery. CHARZO was there in 22 minutes. Absolute lifesaver.',
    name: 'Vaibhav G.',
    role: 'EV Car Owner · Noida',
    initials: 'VG',
  },
  {
    quote: 'Scheduled a morning charge before my commute. Van arrived on time, technician was professional. 10/10.',
    name: 'Vaibhav G.',
    role: 'Electric Scooter · Delhi',
    initials: 'VG',
  },
  {
    quote: 'We run 12 delivery EVs. CHARZO\'s fleet plan cut our downtime by 60%. The dashboard is excellent.',
    name: 'Vaibhav G.',
    role: 'Fleet Manager · Gurugram',
    initials: 'VG',
  },
];

export const TrustSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Stats row */}

        {/* Testimonials */}
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5a0] mb-4">Real Users</p>
          <h2 className="display-md text-white max-w-lg">
            Delhi NCR trusts<br />CHARZO.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="lift rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#00e5a0">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-6">"{t.quote}"</p>

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
