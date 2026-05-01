import React from 'react';
import { GlowButton } from './GlowButton';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section label ── */}
        <div className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5a0] mb-4">About CHARZO</p>
          <h2 className="display-md text-white max-w-2xl">
            India's first mobile<br />
            <span className="text-white/25">EV charging service.</span>
          </h2>
        </div>

        {/* ── Row 1: Who we are + Mission + Vision ── */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">

          {/* Who we are — spans 1 col */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#00e5a0] mb-4">Who We Are</p>
              <p className="text-white/50 text-sm leading-relaxed">
                CHARZO is India's pioneering mobile electric vehicle charging service, driven by innovation and a passion for sustainability. Founded with the aim of facilitating India's transition to electric mobility, we understand the unique challenges of EV charging infrastructure in the Indian context.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/[0.05]">
              <p className="text-[#00e5a0] text-sm">info@charzo.in</p>
              <p className="text-white/50 text-sm">+91 92119 68184</p>
            </div>
          </div>

          {/* Mission */}
          <div className="rounded-2xl border border-[#00e5a0]/15 bg-[#00e5a0]/[0.03] p-7">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00e5a0] mb-4">Our Mission</p>
            <p className="text-white/50 text-sm leading-relaxed">
              To provide accessible, convenient, and efficient EV charging solutions that empower Indian drivers, businesses, and communities to embrace electric vehicles confidently.
            </p>
          </div>

          {/* Vision */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00e5a0] mb-4">Our Vision</p>
            <p className="text-white/50 text-sm leading-relaxed">
              A future where EV charging is seamless, accessible, and integrated into everyday life — significantly contributing to cleaner cities and a greener India.
            </p>
          </div>
        </div>

        {/* ── Row 2: Why We Exist ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00e5a0] mb-4">Why We Exist</p>
          <p className="text-white/50 text-sm leading-relaxed max-w-3xl">
            India is at the cusp of an electric revolution, and CHARZO is dedicated to eliminating charging anxieties and infrastructural barriers. We believe that widespread adoption of electric vehicles will lead to significant environmental and economic benefits, paving the way for sustainable development.
          </p>
        </div>

        {/* ── Row 3: Founder ── */}
        <div className="grid lg:grid-cols-[340px_1fr] gap-5 mb-5">

          {/* Founder image */}
          <div className="rounded-2xl border border-[#00e5a0]/20 overflow-hidden min-h-[280px]">
            <img
              src="/sarthak.jpg"
              alt="Sarthak Singh — Founder, CHARZO"
              className="w-full h-full object-cover object-top"
              style={{ minHeight: '280px' }}
            />
          </div>

          {/* Founder bio */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#00e5a0] mb-5">About the Founder</p>

              <div className="flex items-start gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white leading-tight">Sarthak Singh</h3>
                  <p className="text-[#00e5a0] text-sm font-semibold mt-1">Founder, CHARZO</p>
                  <p className="text-white/30 text-xs mt-0.5">B.Tech · Delhi Technological University (DTU)</p>
                </div>
              </div>

              <p className="text-white/45 text-sm leading-relaxed mb-4">
                Sarthak began his career at ZOID Technologies, a defence-sector R&D startup, where he was immersed in projects that demanded rigorous engineering and creative problem solving. This environment gave him an obsession with tackling real-world challenges head-on.
              </p>
              <p className="text-white/45 text-sm leading-relaxed">
                At CHARZO, Sarthak channels this problem-solving mindset into building practical, accessible EV-charging solutions that move India closer to a cleaner, electrified future.
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/[0.05]">
              {['DTU Graduate', 'ZOID Technologies', 'Defence R&D', 'EV Innovation', 'Clean Energy'].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold text-white/30 border border-white/[0.08] rounded-full px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 4: Join Us CTA ── */}
        <div className="rounded-2xl border border-[#00e5a0]/15 bg-[#00e5a0]/[0.03] p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00e5a0] mb-2">Join Us</p>
            <h3 className="text-xl font-black text-white mb-1">Be part of the EV revolution.</h3>
            <p className="text-white/35 text-sm">Help shape a cleaner, greener future for India with CHARZO.</p>
          </div>
          <GlowButton href="#contact" height={44} fontSize={14} className="px-7 shrink-0">
            <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
              <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="white"/>
            </svg>
            Get Involved
          </GlowButton>
        </div>

      </div>
    </section>
  );
};
