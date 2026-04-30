import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { GlowButton } from './GlowButton';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Coverage', href: '#map' },
  { label: 'How It Works', href: '#how' },
  { label: 'About', href: '#about' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed z-50 transition-all duration-500"
        style={{
          /* Floating pill — centered, not full-width */
          top: scrolled ? '10px' : '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: scrolled ? 'min(780px, calc(100vw - 32px))' : 'min(860px, calc(100vw - 32px))',

          /* Glass capsule */
          borderRadius: scrolled ? '40px' : '36px',
          padding: scrolled ? '0 20px' : '0 24px',
          height: scrolled ? '52px' : '60px',

          /* Glassmorphism */
          background: scrolled
            ? 'rgba(8,8,8,0.75)'
            : 'rgba(12,12,12,0.55)',
          backdropFilter: scrolled ? 'blur(28px) saturate(200%)' : 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(200%)' : 'blur(18px) saturate(160%)',

          /* Glass border — gradient from light top to transparent bottom */
          border: '1px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: scrolled
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Top shine — inner glass reflection */}
        <div style={{
          position: 'absolute',
          top: 0, left: '10%', right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), rgba(0,229,160,0.18), rgba(255,255,255,0.22), transparent)',
          borderRadius: '100%',
          pointerEvents: 'none',
        }} />

        {/* Convex glass highlight — subtle top-center glow */}
        <div style={{
          position: 'absolute',
          top: 0, left: '20%', right: '20%',
          height: '40%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)',
          borderRadius: '0 0 100% 100%',
          pointerEvents: 'none',
        }} />

        {/* ── Logo ── */}
        <a href="#" className="flex items-center gap-2.5 shrink-0 group" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '30px', height: '30px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,229,160,0.05))',
            border: '1px solid rgba(0,229,160,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0,229,160,0.1)',
            transition: 'all 0.3s ease',
          }}
            className="group-hover:shadow-[0_0_18px_rgba(0,229,160,0.25)]"
          >
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/>
            </svg>
          </div>
          <span style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#fff',
            transition: 'color 0.2s ease',
          }}>CHARZO</span>
        </a>

        {/* ── Desktop nav links ── */}
        <nav className="hidden md:flex items-center" style={{ gap: '4px', position: 'relative', zIndex: 1 }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-glass-link"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── CTA ── */}
        <div className="hidden md:flex items-center shrink-0" style={{ position: 'relative', zIndex: 1 }}>
          <GlowButton href="#contact" height={scrolled ? 34 : 38} fontSize={13} className="px-5">
            <svg width="11" height="11" viewBox="0 0 22 22" fill="none">
              <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="white"/>
            </svg>
            Request Charge
          </GlowButton>
        </div>

        {/* ── Mobile toggle ── */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            position: 'relative', zIndex: 1,
          }}
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* ── Mobile menu — separate floating pill ── */}
      {menuOpen && (
        <div
          className="fixed md:hidden z-40"
          style={{
            top: scrolled ? '72px' : '86px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(860px, calc(100vw - 32px))',
            borderRadius: '24px',
            background: 'rgba(8,8,8,0.85)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'mobileMenuIn 0.2s cubic-bezier(0.22,1,0.36,1) forwards',
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <GlowButton href="#contact" fullWidth height={44} fontSize={14}>
              Request Charge · ~25 min
            </GlowButton>
          </div>
        </div>
      )}

      <style>{`
        .nav-glass-link {
          position: relative;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: all 0.25s ease;
          letter-spacing: 0.01em;
        }
        .nav-glass-link::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: rgba(255,255,255,0.0);
          transition: background 0.25s ease;
        }
        .nav-glass-link:hover {
          color: rgba(255,255,255,0.95);
          transform: scale(1.03);
        }
        .nav-glass-link:hover::before {
          background: rgba(255,255,255,0.06);
        }
        /* Active glow dot */
        .nav-glass-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 16px;
          height: 2px;
          border-radius: 1px;
          background: #00e5a0;
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 0 6px rgba(0,229,160,0.6);
        }
        .nav-glass-link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }
        @keyframes mobileMenuIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};
