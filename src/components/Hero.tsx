import React from 'react';
import { GlowButton } from './GlowButton';
import { PhoneMockup } from './PhoneMockup';
import { MapBackground } from './MapBackground';

/* ── Phone mockup: CHARZO app UI ── */
const AppMockup: React.FC = () => (
  <div className="relative flex justify-center items-center h-full select-none">

      {/* Outer glow removed */}

    {/* Phone shell */}
    <div className="relative w-[255px] z-10">
      {/* Frame */}
      <div className="relative rounded-[3rem] border-[3px] border-white/10 bg-[#0d0d0d] shadow-2xl overflow-hidden"
           style={{boxShadow:'0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)', minHeight:'540px'}}>

        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 flex items-center justify-center gap-2 border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/10"/>
          </div>
        </div>

        {/* Screen content */}
        <div className="pt-10 pb-4 px-0 bg-[#080808]">

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 mb-3">
            <span className="text-[10px] font-bold text-white/30">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-[2px] items-end">
                {[3,5,7,9].map((h,i) => <div key={i} className="w-[2.5px] rounded-sm bg-white/30" style={{height:`${h}px`}}/>)}
              </div>
              <div className="w-4 h-2 rounded-sm border border-white/20 flex items-center px-[2px]">
                <div className="w-2.5 h-1 rounded-sm bg-[#00e5a0]"/>
              </div>
            </div>
          </div>

          {/* App header */}
          <div className="flex items-center justify-between px-5 mb-4">
            <div>
              <p className="text-[10px] text-white/30 font-medium">Good morning</p>
              <p className="text-[15px] font-black text-white tracking-tight">CHARZO</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/20 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/>
              </svg>
            </div>
          </div>

          {/* Map area */}
          <div className="relative mx-0 h-[190px] bg-[#111] overflow-hidden">
            {/* Grid lines simulating map */}
            <svg width="100%" height="100%" className="absolute inset-0 opacity-30">
              {[0,20,40,60,80,100,120,140,160].map(y => (
                <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="#1e1e1e" strokeWidth="1"/>
              ))}
              {[0,30,60,90,120,150,180,210,240,260].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="160" stroke="#1e1e1e" strokeWidth="1"/>
              ))}
              {/* Roads */}
              <line x1="0" y1="80" x2="260" y2="80" stroke="#1a1a1a" strokeWidth="8"/>
              <line x1="130" y1="0" x2="130" y2="160" stroke="#1a1a1a" strokeWidth="8"/>
              <line x1="0" y1="80" x2="260" y2="80" stroke="#222" strokeWidth="6"/>
              <line x1="130" y1="0" x2="130" y2="160" stroke="#222" strokeWidth="6"/>
              {/* Road dashes */}
              {[10,50,90,130,170,210].map(x => (
                <line key={x} x1={x} y1="80" x2={x+20} y2="80" stroke="#2a2a2a" strokeWidth="1.5" strokeDasharray="8 6"/>
              ))}
            </svg>

            {/* Route line */}
            <svg width="100%" height="100%" className="absolute inset-0">
              <path d="M60 120 Q80 80 130 80 Q160 80 175 55" stroke="#00e5a0" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.7"/>
            </svg>

            {/* Van pin */}
            <div className="absolute" style={{left:'18%', top:'62%'}}>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#00e5a0] flex items-center justify-center shadow-lg"
                     style={{boxShadow:'0 0 12px rgba(0,229,160,0.5)'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                    <rect x="1" y="8" width="15" height="10" rx="2"/>
                    <path d="M16 12h4l2 4H16"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00e5a0] rotate-45" />
                {/* Pulse */}
                <div className="absolute inset-0 rounded-full border-2 border-[#00e5a0] opacity-40"
                     style={{animation:'ring-pulse 2s ease-out infinite'}}/>
              </div>
            </div>

            {/* User pin */}
            <div className="absolute" style={{left:'62%', top:'22%'}}>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                <div className="w-2.5 h-2.5 rounded-full bg-[#080808]"/>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rotate-45"/>
            </div>

            {/* ETA bubble on map */}
            <div className="absolute top-2 right-2 bg-[#0d0d0d]/90 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1">
              <p className="text-[8px] text-white/40 font-medium">ETA</p>
              <p className="text-[11px] font-black text-[#00e5a0]">~25 min</p>
            </div>
          </div>

          {/* Battery card */}
          <div className="mx-4 mt-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[9px] text-white/30 font-semibold uppercase tracking-widest">Battery Level</p>
                <p className="text-[22px] font-black text-white leading-none mt-0.5">78%</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/30 font-semibold uppercase tracking-widest">Status</p>
                <div className="flex items-center gap-1 mt-0.5 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0]">
                    <div style={{animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite'}} className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] opacity-75"/>
                  </div>
                  <p className="text-[11px] font-bold text-[#00e5a0]">Charging</p>
                </div>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#00e5a0] to-[#00e5a0]" style={{width:'78%'}}/>
            </div>
          </div>

          {/* CTA button inside phone */}
          <div className="mx-4 mt-3">
            <div className="h-10 rounded-xl bg-[#00e5a0] flex items-center justify-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 22 22" fill="none">
                <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="black"/>
              </svg>
              <span className="text-[12px] font-black text-black">Request Charge</span>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-around px-6 pt-4 pb-1">
            {['Home','History','Profile'].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`w-4 h-4 rounded-md ${i === 0 ? 'bg-[#00e5a0]' : 'bg-white/10'}`}/>
                <span className={`text-[8px] font-semibold ${i === 0 ? 'text-[#00e5a0]' : 'text-white/20'}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Home indicator bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-20 h-1 rounded-full bg-white/15"/>
          </div>
        </div>
      </div>

      {/* Side buttons — iPhone style */}
      <div className="absolute right-[-3px] top-32 w-[3px] h-14 rounded-r-full bg-white/10"/>
      <div className="absolute left-[-3px] top-24 w-[3px] h-8 rounded-l-full bg-white/10"/>
      <div className="absolute left-[-3px] top-36 w-[3px] h-12 rounded-l-full bg-white/10"/>
      <div className="absolute left-[-3px] top-52 w-[3px] h-12 rounded-l-full bg-white/10"/>
    </div>

    {/* Floating stat — top right */}
    <div className="absolute top-6 -right-2 lg:-right-8 bg-[#0d0d0d] border border-white/[0.08] rounded-2xl px-5 py-3.5 shadow-xl">
      <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Vans nearby</p>
      <p className="text-2xl font-black text-white">3 <span className="text-[#00e5a0] text-base font-bold">active</span></p>
    </div>

    {/* Floating stat — bottom left */}
    <div className="absolute bottom-10 -left-2 lg:-left-8 bg-[#0d0d0d] border border-white/[0.08] rounded-2xl px-5 py-3.5 shadow-xl">
      <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Avg. arrival</p>
      <p className="text-2xl font-black text-[#00e5a0]">~25 min</p>
    </div>
  </div>
);

/* ── Ticker strip ── */
const tickerItems = [
  'CHARZO IS LIVE IN DELHI NCR',
  'VAN ARRIVES IN ~25 MINUTES',
  '100+ CHARGES COMPLETED',
  'NOIDA · DELHI · GURUGRAM',
  '24×7 AVAILABILITY',
  'ZERO RANGE ANXIETY',
];

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-[#080808] overflow-hidden flex flex-col">
      {/* Animated map background */}
      <MapBackground />

      {/* Vignette overlay */}

      {/* Dark vignette overlay — only darken left side for text readability */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
           style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.5) 28%, rgba(8,8,8,0.0) 55%)' }} />

      {/* Teal glow blobs — removed */}

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 w-full">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 items-center">

            {/* ── Left: Copy ── */}
            <div>
              {/* Live badge */}
              <div className="inline-flex items-center gap-2.5 border border-white/10 rounded-full px-4 py-1.5 mb-8 bg-white/[0.03]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5a0]"></span>
                </span>
                <span className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.15em]">Live · Delhi NCR</span>
              </div>

              {/* Headline */}
              <h1 className="display text-white mb-6">
                Your EV<br />
                Ran Out.<br />
                <span className="accent">We Didn't.</span>
              </h1>

              <div className="mb-10 max-w-md rounded-2xl bg-[#063525] border-2 border-[#00e5a0] p-5" style={{boxShadow:'4px 4px 0 #000'}}>
                <p className="text-[1.05rem] text-white leading-relaxed font-medium">
                  CHARZO dispatches a mobile charging van to your exact location. No stations. No detours. Just power, wherever you are in Delhi NCR.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-14">
                <GlowButton href="#contact" height={52} fontSize={15} className="px-7">
                  <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                    <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="white"/>
                  </svg>
                  Get Charge Now
                </GlowButton>
                <a
                  href="#how"
                  className="btn-press inline-flex items-center gap-2 px-7 rounded-full border border-white/10 text-white/70 font-medium text-[15px] hover:border-white/30 hover:text-white transition-all bg-white/[0.03]"
                  style={{height: '52px'}}
                >
                  See How It Works
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>

              {/* Urgency strip */}
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] max-w-sm">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full border border-[#00e5a030] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                      <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/>
                    </svg>
                  </div>
                  <div className="ring-pulse absolute inset-0 rounded-full border border-[#00e5a0] opacity-60" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Charger arrives in ~25 min</p>
                  <p className="text-white/30 text-xs mt-0.5">3 vans available near Noida right now</p>
                </div>
              </div>
            </div>

            {/* ── Right: App mockup ── */}
            <div className="relative h-[620px] lg:h-[720px]">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </div>

      {/* ── Ticker strip ── */}
      <div className="relative z-10 overflow-hidden" style={{ background: '#00e5a0' }}>
        <div className="ticker-track py-3">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 text-[11px] font-bold text-black uppercase tracking-[0.15em] px-6 whitespace-nowrap">
              <svg width="8" height="8" viewBox="0 0 22 22" fill="none" className="shrink-0">
                <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="black"/>
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
