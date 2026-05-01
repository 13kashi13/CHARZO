import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/mapsLoader';

/* ─────────────────────────────────────────────
   Real Google Map as hero background
   - Loads the actual Google Maps JS API
   - Dark styled map centered on Delhi NCR
   - Animated van markers moving on real roads
   - Radar pulse overlays at key locations
   - Fully non-interactive (pointer-events:none)
     so it doesn't block hero clicks/scroll
───────────────────────────────────────────── */

const MAP_STYLE: google.maps.MapTypeStyle[] = [
  // Clean light base
  { elementType: 'geometry',                                           stylers: [{ color: '#e8e8e8' }] },
  { elementType: 'labels.icon',                                        stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',                                   stylers: [{ color: '#333333' }] },
  { elementType: 'labels.text.stroke',                                 stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#222222' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  // Roads — dark and visible
  { featureType: 'road',            elementType: 'geometry',           stylers: [{ color: '#b0b0b0' }] },
  { featureType: 'road',            elementType: 'geometry.stroke',    stylers: [{ color: '#888888' }] },
  { featureType: 'road',            elementType: 'labels.text.fill',   stylers: [{ color: '#333333' }] },
  { featureType: 'road.highway',    elementType: 'geometry',           stylers: [{ color: '#707070' }] },
  { featureType: 'road.highway',    elementType: 'geometry.stroke',    stylers: [{ color: '#505050' }] },
  { featureType: 'road.highway',    elementType: 'labels.text.fill',   stylers: [{ color: '#222222' }] },
  { featureType: 'road.arterial',   elementType: 'geometry',           stylers: [{ color: '#999999' }] },
  { featureType: 'road.arterial',   elementType: 'geometry.stroke',    stylers: [{ color: '#777777' }] },
  { featureType: 'road.local',      elementType: 'geometry',           stylers: [{ color: '#c8c8c8' }] },
  { featureType: 'road.local',      elementType: 'geometry.stroke',    stylers: [{ color: '#aaaaaa' }] },
  // Water
  { featureType: 'water',           elementType: 'geometry',           stylers: [{ color: '#c9e8f5' }] },
  { featureType: 'water',           elementType: 'labels.text.fill',   stylers: [{ color: '#5b8fa8' }] },
  // POI / transit off
  { featureType: 'poi',             elementType: 'labels',             stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business',                                        stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park',        elementType: 'geometry',           stylers: [{ color: '#d4edda' }] },
  { featureType: 'poi.park',        elementType: 'labels',             stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',                                             stylers: [{ visibility: 'off' }] },
  // Landscape
  { featureType: 'landscape',       elementType: 'geometry',           stylers: [{ color: '#f0f0f0' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry',        stylers: [{ color: '#e8e8e8' }] },
  { featureType: 'administrative',  elementType: 'geometry.stroke',    stylers: [{ color: '#aaaaaa' }, { weight: 1 }] },
];

/* Van routes — one-directional loops, no reversing */
const VAN_ROUTES = [
  // Route 1: Noida Sector 62 — clockwise loop
  [
    { lat: 28.535, lng: 77.391 },
    { lat: 28.548, lng: 77.385 },
    { lat: 28.558, lng: 77.372 },
    { lat: 28.565, lng: 77.358 },
    { lat: 28.555, lng: 77.368 },
    { lat: 28.542, lng: 77.380 },
  ],
  // Route 2: Noida Expressway — south to north
  [
    { lat: 28.510, lng: 77.415 },
    { lat: 28.522, lng: 77.408 },
    { lat: 28.534, lng: 77.395 },
    { lat: 28.545, lng: 77.380 },
    { lat: 28.555, lng: 77.365 },
    { lat: 28.562, lng: 77.352 },
  ],
  // Route 3: Connaught Place loop
  [
    { lat: 28.632, lng: 77.218 },
    { lat: 28.625, lng: 77.228 },
    { lat: 28.618, lng: 77.222 },
    { lat: 28.612, lng: 77.210 },
    { lat: 28.618, lng: 77.200 },
    { lat: 28.626, lng: 77.208 },
  ],
  // Route 4: South Delhi — west to east
  [
    { lat: 28.548, lng: 77.168 },
    { lat: 28.542, lng: 77.182 },
    { lat: 28.535, lng: 77.195 },
    { lat: 28.528, lng: 77.208 },
    { lat: 28.522, lng: 77.220 },
    { lat: 28.518, lng: 77.232 },
  ],
  // Route 5: Gurugram — north to south
  [
    { lat: 28.538, lng: 77.128 },
    { lat: 28.525, lng: 77.118 },
    { lat: 28.512, lng: 77.108 },
    { lat: 28.498, lng: 77.095 },
    { lat: 28.485, lng: 77.082 },
    { lat: 28.472, lng: 77.070 },
  ],
  // Route 6: North Delhi — east to west
  [
    { lat: 28.648, lng: 77.195 },
    { lat: 28.658, lng: 77.182 },
    { lat: 28.668, lng: 77.168 },
    { lat: 28.678, lng: 77.155 },
    { lat: 28.688, lng: 77.142 },
    { lat: 28.695, lng: 77.130 },
  ],
  // Route 7: Rohini — south to north
  [
    { lat: 28.672, lng: 77.138 },
    { lat: 28.682, lng: 77.128 },
    { lat: 28.692, lng: 77.118 },
    { lat: 28.702, lng: 77.108 },
    { lat: 28.712, lng: 77.098 },
    { lat: 28.720, lng: 77.088 },
  ],
  // Route 8: East Delhi — north to south
  [
    { lat: 28.668, lng: 77.298 },
    { lat: 28.655, lng: 77.308 },
    { lat: 28.642, lng: 77.318 },
    { lat: 28.630, lng: 77.328 },
    { lat: 28.618, lng: 77.338 },
    { lat: 28.608, lng: 77.348 },
  ],
  // Route 9: Dwarka — east to west
  [
    { lat: 28.552, lng: 77.095 },
    { lat: 28.562, lng: 77.082 },
    { lat: 28.572, lng: 77.068 },
    { lat: 28.582, lng: 77.055 },
    { lat: 28.592, lng: 77.042 },
    { lat: 28.600, lng: 77.030 },
  ],
  // Route 10: Paharganj — west to east
  [
    { lat: 28.648, lng: 77.188 },
    { lat: 28.650, lng: 77.198 },
    { lat: 28.652, lng: 77.208 },
    { lat: 28.650, lng: 77.218 },
    { lat: 28.648, lng: 77.228 },
    { lat: 28.646, lng: 77.238 },
  ],
  // Route 11: Paharganj — diagonal
  [
    { lat: 28.640, lng: 77.195 },
    { lat: 28.645, lng: 77.205 },
    { lat: 28.650, lng: 77.215 },
    { lat: 28.655, lng: 77.225 },
    { lat: 28.660, lng: 77.235 },
    { lat: 28.665, lng: 77.245 },
  ],
  // Route 12: Karol Bagh / Paharganj border
  [
    { lat: 28.658, lng: 77.182 },
    { lat: 28.660, lng: 77.192 },
    { lat: 28.662, lng: 77.202 },
    { lat: 28.664, lng: 77.212 },
    { lat: 28.662, lng: 77.222 },
    { lat: 28.658, lng: 77.230 },
  ],
  // Route 13: Lajpat Nagar — loop
  [
    { lat: 28.568, lng: 77.232 },
    { lat: 28.560, lng: 77.242 },
    { lat: 28.552, lng: 77.250 },
    { lat: 28.545, lng: 77.242 },
    { lat: 28.550, lng: 77.232 },
    { lat: 28.560, lng: 77.225 },
  ],
  // Route 14: Shahdara — south to north
  [
    { lat: 28.648, lng: 77.292 },
    { lat: 28.658, lng: 77.300 },
    { lat: 28.668, lng: 77.308 },
    { lat: 28.678, lng: 77.316 },
    { lat: 28.688, lng: 77.322 },
    { lat: 28.695, lng: 77.330 },
  ],
  // Route 15: Hauz Khas — loop
  [
    { lat: 28.548, lng: 77.198 },
    { lat: 28.540, lng: 77.208 },
    { lat: 28.532, lng: 77.215 },
    { lat: 28.525, lng: 77.208 },
    { lat: 28.530, lng: 77.198 },
    { lat: 28.540, lng: 77.192 },
  ],
  // Route 16: Mayur Vihar — west to east
  [
    { lat: 28.608, lng: 77.288 },
    { lat: 28.614, lng: 77.298 },
    { lat: 28.620, lng: 77.308 },
    { lat: 28.626, lng: 77.318 },
    { lat: 28.630, lng: 77.328 },
    { lat: 28.635, lng: 77.338 },
  ],
  // Route 17: Janakpuri — north to south
  [
    { lat: 28.628, lng: 77.078 },
    { lat: 28.618, lng: 77.088 },
    { lat: 28.608, lng: 77.098 },
    { lat: 28.598, lng: 77.108 },
    { lat: 28.588, lng: 77.118 },
    { lat: 28.578, lng: 77.128 },
  ],
  // Route 18: Okhla — loop
  [
    { lat: 28.538, lng: 77.268 },
    { lat: 28.530, lng: 77.278 },
    { lat: 28.522, lng: 77.285 },
    { lat: 28.515, lng: 77.278 },
    { lat: 28.520, lng: 77.268 },
    { lat: 28.530, lng: 77.260 },
  ],
  // Route 19: Pitampura — loop
  [
    { lat: 28.698, lng: 77.128 },
    { lat: 28.706, lng: 77.138 },
    { lat: 28.714, lng: 77.148 },
    { lat: 28.720, lng: 77.140 },
    { lat: 28.714, lng: 77.130 },
    { lat: 28.706, lng: 77.122 },
  ],
  // Route 20: Greater Noida — loop
  [
    { lat: 28.478, lng: 77.488 },
    { lat: 28.488, lng: 77.498 },
    { lat: 28.498, lng: 77.505 },
    { lat: 28.505, lng: 77.495 },
    { lat: 28.498, lng: 77.482 },
    { lat: 28.488, lng: 77.475 },
  ],
  // Route 21: Bisrakh — north to south
  [
    { lat: 28.592, lng: 77.418 },
    { lat: 28.582, lng: 77.425 },
    { lat: 28.572, lng: 77.432 },
    { lat: 28.562, lng: 77.438 },
    { lat: 28.552, lng: 77.445 },
    { lat: 28.542, lng: 77.450 },
  ],
  // Route 22: Bisrakh east loop
  [
    { lat: 28.575, lng: 77.435 },
    { lat: 28.582, lng: 77.445 },
    { lat: 28.588, lng: 77.455 },
    { lat: 28.580, lng: 77.462 },
    { lat: 28.572, lng: 77.455 },
    { lat: 28.568, lng: 77.442 },
  ],
  // Route 23: Bisrakh / Sector 137 corridor
  [
    { lat: 28.560, lng: 77.412 },
    { lat: 28.568, lng: 77.422 },
    { lat: 28.575, lng: 77.432 },
    { lat: 28.582, lng: 77.442 },
    { lat: 28.588, lng: 77.452 },
    { lat: 28.594, lng: 77.462 },
  ],
  // Route 24: Noida Sector 137 / Ecotech
  [
    { lat: 28.538, lng: 77.428 },
    { lat: 28.548, lng: 77.438 },
    { lat: 28.558, lng: 77.448 },
    { lat: 28.565, lng: 77.458 },
    { lat: 28.558, lng: 77.468 },
    { lat: 28.548, lng: 77.458 },
  ],
  // Route 25: Chipyana Khurd / right edge
  [
    { lat: 28.598, lng: 77.448 },
    { lat: 28.605, lng: 77.458 },
    { lat: 28.612, lng: 77.468 },
    { lat: 28.618, lng: 77.478 },
    { lat: 28.612, lng: 77.488 },
    { lat: 28.605, lng: 77.478 },
  ],
  // Route 26: Noida Expressway south — right side
  [
    { lat: 28.530, lng: 77.388 },
    { lat: 28.520, lng: 77.398 },
    { lat: 28.510, lng: 77.408 },
    { lat: 28.500, lng: 77.418 },
    { lat: 28.492, lng: 77.428 },
    { lat: 28.485, lng: 77.438 },
  ],
  // Route 27: Sector 62 / Sector 63 Noida
  [
    { lat: 28.618, lng: 77.368 },
    { lat: 28.625, lng: 77.378 },
    { lat: 28.632, lng: 77.388 },
    { lat: 28.638, lng: 77.398 },
    { lat: 28.632, lng: 77.408 },
    { lat: 28.625, lng: 77.398 },
  ],
];

/* Radar pulse locations */
const RADAR_POINTS = [
  { lat: 28.535, lng: 77.391 },
  { lat: 28.630, lng: 77.220 },
  { lat: 28.495, lng: 77.090 },
  { lat: 28.680, lng: 77.150 },
  { lat: 28.560, lng: 77.300 },
];

const VAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="12" fill="#063525" stroke="#00e5a0" stroke-width="1.5"/>
  <rect x="6" y="10" width="10" height="8" rx="1.5" fill="none" stroke="#00e5a0" stroke-width="1.2"/>
  <path d="M16 13h4l2 4H16" fill="none" stroke="#00e5a0" stroke-width="1.2"/>
  <circle cx="9" cy="19" r="1.8" fill="#00e5a0"/>
  <circle cx="20" cy="19" r="1.8" fill="#00e5a0"/>
</svg>`;

const svgUrl = (svg: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/* loadMaps — uses shared singleton */
const loadMaps = loadGoogleMaps;

export const MapBackground: React.FC = () => {
  const mapDivRef   = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const mapObj      = useRef<google.maps.Map | null>(null);
  const rafRef      = useRef<number>(0);
  const [ready, setReady] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  /* ── Init map ── */
  useEffect(() => {
    if (!apiKey || !mapDivRef.current) return;
    loadMaps(apiKey).then(() => {
      if (!mapDivRef.current || mapObj.current) return;

      const map = new google.maps.Map(mapDivRef.current, {
        center: { lat: 28.580, lng: 77.250 },
        zoom: 12,
        styles: MAP_STYLE,
        disableDefaultUI: true,
        gestureHandling: 'none',
        keyboardShortcuts: false,
        backgroundColor: '#f5f5f5',
        clickableIcons: false,
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapObj.current = map;
      setReady(true);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [apiKey]);

  /* ── Animate vans on canvas — zero DOM updates per frame ── */
  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    const map = mapObj.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const state = VAN_ROUTES.map(route => ({
      route,
      seg: 0,
      t: Math.random(),
    }));

    let active = true;
    let lastTime = 0;

    const observer = new IntersectionObserver(
      ([entry]) => { active = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    /* Convert lat/lng → canvas pixel */
    const toPixel = (lat: number, lng: number) => {
      const proj   = map.getProjection();
      const bounds = map.getBounds();
      if (!proj || !bounds) return null;
      const ne    = bounds.getNorthEast();
      const sw    = bounds.getSouthWest();
      const neP   = proj.fromLatLngToPoint(ne)!;
      const swP   = proj.fromLatLngToPoint(sw)!;
      const scale = Math.pow(2, map.getZoom()!);
      const W     = canvas.width;
      const H     = canvas.height;
      const pt    = proj.fromLatLngToPoint(new google.maps.LatLng(lat, lng))!;
      return {
        x: ((pt.x - swP.x) * scale / ((neP.x - swP.x) * scale)) * W,
        y: ((pt.y - neP.y) * scale / ((swP.y - neP.y) * scale)) * H,
      };
    };

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (!active) return;

      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      const speed = 0.00018 * dt;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      state.forEach(s => {
        s.t += speed;
        if (s.t >= 1) {
          s.t -= 1;
          // seg cycles 0 → route.length-1, then wraps to 0
          // segB = (seg+1) % route.length always valid, closes the loop
          s.seg = (s.seg + 1) % s.route.length;
        }
        const a = s.route[s.seg];
        const b = s.route[(s.seg + 1) % s.route.length];
        if (!a || !b) return;

        const px = toPixel(lerp(a.lat, b.lat, s.t), lerp(a.lng, b.lng, s.t));
        if (!px) return;

        // Block only the actual headline text area (top-left corner)
        // Headline sits roughly in x < 38% AND y < 65%
        if (px.x < canvas.width * 0.38 && px.y < canvas.height * 0.65) return;

        const x = px.x, y = px.y;
        ctx.save();
        ctx.translate(x, y);

        // Outer circle background
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#063525';
        ctx.fill();
        ctx.strokeStyle = '#00e5a0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Van body (cab)
        ctx.strokeStyle = '#00e5a0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-9, -5, 10, 8, 1.5);
        ctx.stroke();

        // Van cargo/front
        ctx.beginPath();
        ctx.moveTo(1, -2.5);
        ctx.lineTo(6.5, -2.5);
        ctx.lineTo(8, 1.5);
        ctx.lineTo(1, 1.5);
        ctx.stroke();

        // Wheels
        ctx.fillStyle = '#00e5a0';
        ctx.beginPath(); ctx.arc(-5, 4, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(5, 4, 2.2, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
      });
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [ready]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Actual Google Map */}
      <div ref={mapDivRef} className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(0)' }} />

      {/* Van canvas — all 18 vans drawn in one pass, zero DOM updates */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }} />

      {/* Radar pulse canvas overlay */}
      {ready && <RadarOverlay />}

      {/* Dark vignette — fades light map into dark hero */}
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(to right, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.75) 25%, rgba(8,8,8,0.2) 50%, rgba(8,8,8,0.05) 100%),
          linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0.0) 15%, rgba(8,8,8,0.0) 85%, rgba(8,8,8,0.8) 100%)
        `,
      }} />
    </div>
  );
};

/* ── Radar pulse canvas ── */
const RadarOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* Fixed screen positions for radar pulses (% of canvas) */
    const origins = [
      { x: 0.72, y: 0.55, phase: 0 },
      { x: 0.45, y: 0.25, phase: 1.2 },
      { x: 0.20, y: 0.70, phase: 2.4 },
      { x: 0.60, y: 0.75, phase: 0.6 },
      { x: 0.82, y: 0.30, phase: 1.8 },
    ];

    let frame = 0;
    let lastTime = 0;
    const RADAR_FPS = 20;
    const RADAR_MS = 1000 / RADAR_FPS;

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastTime < RADAR_MS) return; // throttle to 20fps
      lastTime = now;
      frame++;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      origins.forEach(o => {
        const cx = o.x * W;
        const cy = o.y * H;
        const t  = (frame * 0.006 + o.phase) % (Math.PI * 2);

        for (let ring = 0; ring < 3; ring++) {
          const rt       = (t + ring * 0.9) % (Math.PI * 2);
          const progress = rt / (Math.PI * 2);
          const radius   = progress * 60;
          const opacity  = (1 - progress) * 0.22;
          if (opacity <= 0) continue;

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,229,160,${opacity.toFixed(3)})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }

        /* Center dot */
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,229,160,0.4)';
        ctx.fill();
      });
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ willChange: 'auto' }}
    />
  );
};
