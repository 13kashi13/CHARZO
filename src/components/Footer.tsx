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
              {[
                { label: 'X', href: '#' },
                { label: 'IG', href: '#' },
                { label: 'LI', href: '#' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-[10px] font-bold text-white/25 hover:text-[#00e5a0] hover:border-[#00e5a0]/20 transition-all"
                >
                  {s.label}
                </a>
              ))}
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
