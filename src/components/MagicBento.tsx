import { useRef, useEffect, useCallback, useState } from 'react';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 6;
const DEFAULT_SPOTLIGHT_RADIUS = 280;
const DEFAULT_GLOW_COLOR = '0, 229, 160';
const MOBILE_BREAKPOINT = 768;

const createParticle = (x: number, y: number, color: string) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `position:absolute;width:3px;height:3px;border-radius:50%;background:rgba(${color},1);box-shadow:0 0 6px rgba(${color},0.6);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`;
  return el;
};

const updateGlow = (card: HTMLElement, mx: number, my: number, intensity: number, radius: number) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty('--glow-x', `${((mx - r.left) / r.width) * 100}%`);
  card.style.setProperty('--glow-y', `${((my - r.top) / r.height) * 100}%`);
  card.style.setProperty('--glow-intensity', intensity.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties; disableAnimations?: boolean; particleCount?: number; glowColor?: string; enableTilt?: boolean; clickEffect?: boolean; enableMagnetism?: boolean }> = ({
  children, className = '', style, disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT, glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true, clickEffect = false, enableMagnetism = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const particles = useRef<HTMLElement[]>([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hovered = useRef(false);
  const memoized = useRef<HTMLElement[]>([]);
  const initialized = useRef(false);
  const magAnim = useRef<gsap.core.Tween | null>(null);

  const init = useCallback(() => {
    if (initialized.current || !ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    memoized.current = Array.from({ length: particleCount }, () => createParticle(Math.random() * width, Math.random() * height, glowColor));
    initialized.current = true;
  }, [particleCount, glowColor]);

  const clear = useCallback(() => {
    timeouts.current.forEach(clearTimeout); timeouts.current = [];
    magAnim.current?.kill();
    particles.current.forEach(p => gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)', onComplete: () => p.parentNode?.removeChild(p) }));
    particles.current = [];
  }, []);

  const spawn = useCallback(() => {
    if (!ref.current || !hovered.current) return;
    if (!initialized.current) init();
    memoized.current.forEach((p, i) => {
      const t = setTimeout(() => {
        if (!hovered.current || !ref.current) return;
        const c = p.cloneNode(true) as HTMLElement;
        ref.current.appendChild(c); particles.current.push(c);
        gsap.fromTo(c, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(c, { x: (Math.random()-.5)*80, y: (Math.random()-.5)*80, rotation: Math.random()*360, duration: 2+Math.random()*2, ease: 'none', repeat: -1, yoyo: true });
        gsap.to(c, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, i * 80);
      timeouts.current.push(t);
    });
  }, [init]);

  useEffect(() => {
    if (disableAnimations || !ref.current) return;
    const el = ref.current;
    const onEnter = () => { hovered.current = true; spawn(); if (enableTilt) gsap.to(el, { rotateX: 4, rotateY: 4, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 }); };
    const onLeave = () => { hovered.current = false; clear(); if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' }); if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' }); };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect(), x = e.clientX-r.left, y = e.clientY-r.top, cx = r.width/2, cy = r.height/2;
      if (enableTilt) gsap.to(el, { rotateX: ((y-cy)/cy)*-8, rotateY: ((x-cx)/cx)*8, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
      if (enableMagnetism) magAnim.current = gsap.to(el, { x: (x-cx)*0.04, y: (y-cy)*0.04, duration: 0.3, ease: 'power2.out' });
    };
    const onClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const r = el.getBoundingClientRect(), x = e.clientX-r.left, y = e.clientY-r.top;
      const d = Math.max(Math.hypot(x,y), Math.hypot(x-r.width,y), Math.hypot(x,y-r.height), Math.hypot(x-r.width,y-r.height));
      const rip = document.createElement('div');
      rip.style.cssText = `position:absolute;width:${d*2}px;height:${d*2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.35) 0%,rgba(${glowColor},0.15) 30%,transparent 70%);left:${x-d}px;top:${y-d}px;pointer-events:none;z-index:1000;`;
      el.appendChild(rip);
      gsap.fromTo(rip, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => rip.remove() });
    };
    el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove); el.addEventListener('click', onClick);
    return () => { hovered.current = false; el.removeEventListener('mouseenter', onEnter); el.removeEventListener('mouseleave', onLeave); el.removeEventListener('mousemove', onMove); el.removeEventListener('click', onClick); clear(); };
  }, [spawn, clear, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return <div ref={ref} className={`${className} particle-container`} style={{ ...style, position: 'relative', overflow: 'hidden' }}>{children}</div>;
};

const GlobalSpotlight: React.FC<{ gridRef: React.RefObject<HTMLDivElement>; disableAnimations?: boolean; enabled?: boolean; spotlightRadius?: number; glowColor?: string }> = ({
  gridRef, disableAnimations=false, enabled=true, spotlightRadius=DEFAULT_SPOTLIGHT_RADIUS, glowColor=DEFAULT_GLOW_COLOR,
}) => {
  const spotRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;
    const spot = document.createElement('div');
    spot.className = 'global-spotlight';
    spot.style.cssText = `position:fixed;width:600px;height:600px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${glowColor},0.12) 0%,rgba(${glowColor},0.06) 20%,rgba(${glowColor},0.02) 40%,transparent 65%);z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
    document.body.appendChild(spot); spotRef.current = spot;
    const prox = spotlightRadius * 0.5, fade = spotlightRadius * 0.75;
    const onMove = (e: MouseEvent) => {
      if (!spotRef.current || !gridRef.current) return;
      const sec = gridRef.current.closest('.bento-section'), rect = sec?.getBoundingClientRect();
      const inside = rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      const cards = gridRef.current.querySelectorAll<HTMLElement>('.magic-bento-card');
      if (!inside) { gsap.to(spotRef.current, { opacity: 0, duration: 0.3 }); cards.forEach(c => c.style.setProperty('--glow-intensity', '0')); return; }
      let minD = Infinity;
      cards.forEach(card => { const r = card.getBoundingClientRect(), cx = r.left+r.width/2, cy = r.top+r.height/2, dist = Math.max(0, Math.hypot(e.clientX-cx, e.clientY-cy)-Math.max(r.width,r.height)/2); minD = Math.min(minD, dist); updateGlow(card, e.clientX, e.clientY, dist<=prox?1:dist<=fade?(fade-dist)/(fade-prox):0, spotlightRadius); });
      gsap.to(spotRef.current, { left: e.clientX, top: e.clientY, duration: 0.1 });
      const op = minD<=prox?0.7:minD<=fade?((fade-minD)/(fade-prox))*0.7:0;
      gsap.to(spotRef.current, { opacity: op, duration: op>0?0.2:0.5 });
    };
    const onLeave = () => { gridRef.current?.querySelectorAll<HTMLElement>('.magic-bento-card').forEach(c => c.style.setProperty('--glow-intensity','0')); if (spotRef.current) gsap.to(spotRef.current, { opacity: 0, duration: 0.3 }); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseleave', onLeave);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); spotRef.current?.parentNode?.removeChild(spotRef.current); };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);
  return null;
};

export interface BentoCard { icon: React.ReactNode; label: string; location: string; title: string; description: string; }

interface MagicBentoProps { cards: BentoCard[]; textAutoHide?: boolean; enableStars?: boolean; enableSpotlight?: boolean; enableBorderGlow?: boolean; disableAnimations?: boolean; spotlightRadius?: number; particleCount?: number; enableTilt?: boolean; glowColor?: string; clickEffect?: boolean; enableMagnetism?: boolean; }

const MagicBento: React.FC<MagicBentoProps> = ({ cards, textAutoHide=true, enableBorderGlow=true, glowColor=DEFAULT_GLOW_COLOR }) => {
  const cls = `magic-bento-card ${textAutoHide?'magic-bento-card--text-autohide':''} ${enableBorderGlow?'magic-bento-card--border-glow':''}`;
  const sty: React.CSSProperties = { backgroundColor: '#0d0d0d', ['--glow-color' as string]: glowColor };
  const content = (card: BentoCard) => (<><div className="magic-bento-card__header"><div className="magic-bento-card__icon">{card.icon}</div><span className="magic-bento-card__label">{card.label}</span></div><div className="magic-bento-card__content"><p className="magic-bento-card__location">{card.location}</p><h2 className="magic-bento-card__title">{card.title}</h2><p className="magic-bento-card__description">{card.description}</p></div></>);
  return (<div className="card-grid bento-section">{cards.map((card, i) => (<div key={i} className={cls} style={sty}>{content(card)}</div>))}</div>);
};

export default MagicBento;
