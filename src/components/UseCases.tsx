import React from 'react';
import { Home, Building2, AlertTriangle, ShoppingBag } from 'lucide-react';

const cases = [
  {
    icon: <Home className="w-5 h-5 text-[#00e5a0]" />,
    location: 'At Home',
    headline: 'Wake up to a full battery.',
    body: 'Schedule an overnight charge. Our van arrives while you sleep, plugs in, and leaves. You wake up to 100%.',
    tag: 'Most booked',
    tagColor: 'text-[#00e5a0] border-[#00e5a020] bg-[#00e5a008]',
  },
  {
    icon: <Building2 className="w-5 h-5 text-white/50" />,
    location: 'At the Office',
    headline: 'Charge while you work.',
    body: 'Drop your location pin when you park. We charge your EV in the parking lot while you\'re in meetings.',
    tag: 'Zero disruption',
    tagColor: 'text-white/50 border-white/10 bg-white/[0.03]',
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    location: 'On the Road',
    headline: 'Stranded? We\'re 25 min away.',
    body: 'Low battery on the highway or in an unfamiliar area? Call CHARZO. We come to you, no tow truck needed.',
    tag: 'Emergency rescue',
    tagColor: 'text-orange-400 border-orange-400/20 bg-orange-400/5',
  },
  {
    icon: <ShoppingBag className="w-5 h-5 text-white/50" />,
    location: 'At a Mall / Event',
    headline: 'Shop. We charge.',
    body: 'Heading to a mall or event? Share your parking spot. We\'ll have your EV charged before you\'re done.',
    tag: 'Hands-free',
    tagColor: 'text-white/50 border-white/10 bg-white/[0.03]',
  },
];

export const UseCases: React.FC = () => {
  return (
    <section id="why" className="py-24 bg-[#080808] relative overflow-hidden">
      {/* CHARZO watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[clamp(80px,18vw,200px)] font-black text-white/[0.025] tracking-[-0.05em] leading-none">CHARZO</span>
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5a0] mb-4">Real-World Use</p>
          <h2 className="display-md text-white max-w-xl">
            Charging that fits<br />your life.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cases.map((c, i) => (
            <div
              key={i}
              className="lift group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden cursor-default"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-[#00e5a0] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded-2xl" />

              <div className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center mb-5">
                {c.icon}
              </div>

              <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-4 ${c.tagColor}`}>
                {c.tag}
              </span>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">{c.location}</p>
              <h3 className="text-[1.05rem] font-bold text-white mb-3 leading-snug">{c.headline}</h3>
              <p className="text-sm text-white/35 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
