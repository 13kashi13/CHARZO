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

          {/* Founder image + LinkedIn */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-[#00e5a0]/20 overflow-hidden min-h-[280px]">
              <img
                src="/sarthak.jpg"
                alt="Sarthak Singh — Founder, CHARZO"
                className="w-full h-full object-cover object-top"
                style={{ minHeight: '280px' }}
              />
            </div>
            <a
              href="https://www.linkedin.com/in/sarthak-singh-084531250/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 transition-all group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-semibold text-white/50 group-hover:text-white transition-colors">Sarthak Singh</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 group-hover:text-white/50 ml-auto transition-colors">
                <path d="M7 17L17 7M17 7H7M17 7v10"/>
              </svg>
            </a>
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
