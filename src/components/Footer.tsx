import React from 'react';

const links = [
  { label: 'Why CHARZO', href: '#why' },
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#030303] border-t border-white/[0.04] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/>
              </svg>
              <span className="text-lg font-black tracking-[-0.04em] text-white">CHARZO</span>
            </div>
            <p className="text-sm text-white/25 leading-relaxed max-w-xs">
              Mobile EV charging for India. We come to you, anytime, anywhere in Delhi NCR.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Navigation</p>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-white/35 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Contact</p>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-white/35">info@charzo.in</p>
              <p className="text-sm text-white/35">+91 92119 68184</p>
              <p className="text-sm text-white/35">B-13A, 1st Floor, Block B</p>
              <p className="text-sm text-white/35">Sector 132, Noida, UP 201304</p>
            </div>
            {/* Social */}
            <div className="flex gap-2">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/charzo.ev?igsh=dmt2Nm00MG5jaTBo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center hover:border-pink-500/40 hover:bg-pink-500/10 transition-all group"
                title="Instagram"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-pink-400 transition-colors">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="rgba(255,255,255,0.3)" stroke="none" className="group-hover:fill-pink-400"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/charzo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 transition-all group"
                title="LinkedIn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)" className="group-hover:fill-[#0A66C2] transition-colors">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/15">© 2026 CHARZO Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="text-[11px] text-white/15">Made with <svg width="10" height="10" viewBox="0 0 22 22" fill="none" className="inline-block mx-0.5 -mt-0.5"><path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/></svg> in India</p>
        </div>
      </div>
    </footer>
  );
};
