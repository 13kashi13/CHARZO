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
  // Base — near black
  { elementType: 'geometry',                                           stylers: [{ color: '#141414' }] },
  // Labels
  { elementType: 'labels.icon',                                        stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',                                   stylers: [{ color: '#606060' }] },
  { elementType: 'labels.text.stroke',                                 stylers: [{ color: '#0a0a0a' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  // Roads — high contrast white-grey so they glow against dark base
  { featureType: 'road',            elementType: 'geometry',           stylers: [{ color: '#4a4a4a' }] },
  { featureType: 'road',            elementType: 'geometry.stroke',    stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road',            elementType: 'labels.text.fill',   stylers: [{ color: '#707070' }] },
  { featureType: 'road.highway',    elementType: 'geometry',           stylers: [{ color: '#686868' }] },
  { featureType: 'road.highway',    elementType: 'geometry.stroke',    stylers: [{ color: '#383838' }] },
  { featureType: 'road.highway',    elementType: 'labels.text.fill',   stylers: [{ color: '#909090' }] },
  { featureType: 'road.arterial',   elementType: 'geometry',           stylers: [{ color: '#3e3e3e' }] },
  { featureType: 'road.local',      elementType: 'geometry',           stylers: [{ color: '#303030' }] },
  // Water — distinct dark blue
  { featureType: 'water',           elementType: 'geometry',           stylers: [{ color: '#0a1628' }] },
  { featureType: 'water',           elementType: 'labels.text.fill',   stylers: [{ color: '#1a3a5a' }] },
  // Parks — very dark, no green
  { featureType: 'poi.park',        elementType: 'geometry',           stylers: [{ color: '#181818' }] },
  { featureType: 'poi.park',        elementType: 'labels',             stylers: [{ visibility: 'off' }] },
  // All POI off
  { featureType: 'poi',             elementType: 'labels',             stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business',                                        stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical',                                         stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school',                                          stylers: [{ visibility: 'off' }] },
  // Transit off
  { featureType: 'transit',                                             stylers: [{ visibility: 'off' }] },
  // Landscape — slightly lighter than base so blocks are visible
  { featureType: 'landscape',       elementType: 'geometry',           stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry',        stylers: [{ color: '#202020' }] },
  { featureType: 'landscape.natural',  elementType: 'geometry',        stylers: [{ color: '#161616' }] },
  // Admin borders
  { featureType: 'administrative',  elementType: 'geometry.stroke',    stylers: [{ color: '#3a3a3a' }, { weight: 0.8 }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
];

/* Van routes — lat/lng waypoints around Delhi NCR */
const VAN_ROUTES = [
  // Route 1: Noida Sector 62 loop — stays east of Yamuna
  [
    { lat: 28.535, lng: 77.391 },
    { lat: 28.548, lng: 77.385 },
    { lat: 28.558, lng: 77.372 },
    { lat: 28.565, lng: 77.358 },
    { lat: 28.558, lng: 77.372 },
    { lat: 28.548, lng: 77.385 },
    { lat: 28.535, lng: 77.391 },
  ],
  // Route 2: Noida Expressway — stays east of Yamuna
  [
    { lat: 28.522, lng: 77.408 },
    { lat: 28.534, lng: 77.395 },
    { lat: 28.545, lng: 77.380 },
    { lat: 28.555, lng: 77.365 },
    { lat: 28.545, lng: 77.380 },
    { lat: 28.534, lng: 77.395 },
    { lat: 28.522, lng: 77.408 },
  ],
  // Route 3: Connaught Place / Central Delhi — west of Yamuna
  [
    { lat: 28.632, lng: 77.218 },
    { lat: 28.620, lng: 77.208 },
    { lat: 28.608, lng: 77.198 },
    { lat: 28.595, lng: 77.190 },
    { lat: 28.608, lng: 77.198 },
    { lat: 28.620, lng: 77.208 },
    { lat: 28.632, lng: 77.218 },
  ],
  // Route 4: South Delhi — well west of Yamuna
  [
    { lat: 28.548, lng: 77.178 },
    { lat: 28.535, lng: 77.188 },
    { lat: 28.522, lng: 77.198 },
    { lat: 28.510, lng: 77.208 },
    { lat: 28.522, lng: 77.198 },
    { lat: 28.535, lng: 77.188 },
    { lat: 28.548, lng: 77.178 },
  ],
  // Route 5: Gurugram — far west, no river issue
  [
    { lat: 28.498, lng: 77.088 },
    { lat: 28.512, lng: 77.102 },
    { lat: 28.525, lng: 77.115 },
    { lat: 28.538, lng: 77.128 },
    { lat: 28.525, lng: 77.115 },
    { lat: 28.512, lng: 77.102 },
    { lat: 28.498, lng: 77.088 },
  ],
  // Route 6: North Delhi — west of Yamuna
  [
    { lat: 28.695, lng: 77.148 },
    { lat: 28.678, lng: 77.162 },
    { lat: 28.662, lng: 77.175 },
    { lat: 28.648, lng: 77.188 },
    { lat: 28.662, lng: 77.175 },
    { lat: 28.678, lng: 77.162 },
    { lat: 28.695, lng: 77.148 },
  ],
  // Route 7: Rohini / West Delhi
  [
    { lat: 28.718, lng: 77.098 },
    { lat: 28.702, lng: 77.112 },
    { lat: 28.688, lng: 77.125 },
    { lat: 28.672, lng: 77.138 },
    { lat: 28.688, lng: 77.125 },
    { lat: 28.702, lng: 77.112 },
    { lat: 28.718, lng: 77.098 },
  ],
  // Route 8: East Delhi — stays east of Yamuna, uses NH-24 corridor
  [
    { lat: 28.658, lng: 77.298 },
    { lat: 28.645, lng: 77.312 },
    { lat: 28.632, lng: 77.325 },
    { lat: 28.618, lng: 77.338 },
    { lat: 28.632, lng: 77.325 },
    { lat: 28.645, lng: 77.312 },
    { lat: 28.658, lng: 77.298 },
  ],
  // Route 9: Dwarka / South-West Delhi
  [
    { lat: 28.592, lng: 77.048 },
    { lat: 28.578, lng: 77.062 },
    { lat: 28.565, lng: 77.075 },
    { lat: 28.552, lng: 77.088 },
    { lat: 28.565, lng: 77.075 },
    { lat: 28.578, lng: 77.062 },
    { lat: 28.592, lng: 77.048 },
  ],
  // Route 10: Pitampura / North-West Delhi
  [
    { lat: 28.698, lng: 77.128 },
    { lat: 28.712, lng: 77.142 },
    { lat: 28.725, lng: 77.155 },
    { lat: 28.712, lng: 77.142 },
    { lat: 28.698, lng: 77.128 },
  ],
  // Route 11: Noida Sector 18 — east of Yamuna
  [
    { lat: 28.568, lng: 77.322 },
    { lat: 28.578, lng: 77.338 },
    { lat: 28.588, lng: 77.352 },
    { lat: 28.578, lng: 77.338 },
    { lat: 28.568, lng: 77.322 },
  ],
  // Route 12: Greater Noida — far east
  [
    { lat: 28.478, lng: 77.502 },
    { lat: 28.492, lng: 77.488 },
    { lat: 28.505, lng: 77.472 },
    { lat: 28.492, lng: 77.488 },
    { lat: 28.478, lng: 77.502 },
  ],
  // Route 13: Janakpuri / West Delhi
  [
    { lat: 28.622, lng: 77.082 },
    { lat: 28.608, lng: 77.095 },
    { lat: 28.595, lng: 77.108 },
    { lat: 28.608, lng: 77.095 },
    { lat: 28.622, lng: 77.082 },
  ],
  // Route 14: Lajpat Nagar / South Delhi
  [
    { lat: 28.568, lng: 77.238 },
    { lat: 28.555, lng: 77.225 },
    { lat: 28.542, lng: 77.212 },
    { lat: 28.555, lng: 77.225 },
    { lat: 28.568, lng: 77.238 },
  ],
  // Route 15: Shahdara — east of Yamuna
  [
    { lat: 28.668, lng: 77.298 },
    { lat: 28.678, lng: 77.312 },
    { lat: 28.688, lng: 77.325 },
    { lat: 28.678, lng: 77.312 },
    { lat: 28.668, lng: 77.298 },
  ],
  // Route 16: Saket / South Delhi
  [
    { lat: 28.522, lng: 77.208 },
    { lat: 28.510, lng: 77.195 },
    { lat: 28.498, lng: 77.182 },
    { lat: 28.510, lng: 77.195 },
    { lat: 28.522, lng: 77.208 },
  ],
  // Route 17: Faridabad — south-east, east of Yamuna
  [
    { lat: 28.412, lng: 77.312 },
    { lat: 28.428, lng: 77.298 },
    { lat: 28.442, lng: 77.285 },
    { lat: 28.428, lng: 77.298 },
    { lat: 28.412, lng: 77.312 },
  ],
  // Route 18: Shalimar Bagh / North Delhi
  [
    { lat: 28.718, lng: 77.168 },
    { lat: 28.705, lng: 77.155 },
    { lat: 28.692, lng: 77.142 },
    { lat: 28.705, lng: 77.155 },
    { lat: 28.718, lng: 77.168 },
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
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<google.maps.Map | null>(null);
  const vanMarkers= useRef<google.maps.Marker[]>([]);
  const rafRef    = useRef<number>(0);
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
        backgroundColor: '#1c1c1c',
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

      /* Create van markers */
      VAN_ROUTES.forEach(() => {
        const m = new google.maps.Marker({
          map,
          icon: {
            url: svgUrl(VAN_SVG),
            scaledSize: new google.maps.Size(28, 28),
            anchor: new google.maps.Point(14, 14),
          },
          zIndex: 10,
          optimized: true,
        });
        vanMarkers.current.push(m);
      });

      setReady(true);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      vanMarkers.current.forEach(m => m.setMap(null));
      vanMarkers.current = [];
    };
  }, [apiKey]);

  /* ── Animate vans — throttled to 12fps, saves main thread ── */
  useEffect(() => {
    if (!ready) return;

    const state = VAN_ROUTES.map(route => ({
      route,
      seg: 0,
      t: Math.random(),
    }));

    let active = true;

    // Pause animation when hero is not visible
    const observer = new IntersectionObserver(
      ([entry]) => { active = entry.isIntersecting; },
      { threshold: 0 }
    );
    if (mapDivRef.current) observer.observe(mapDivRef.current);

    const tick = () => {
      if (!active) return;
      state.forEach((s, i) => {
        s.t += 0.005;
        if (s.t >= 1) {
          s.t = 0;
          s.seg = (s.seg + 1) % (s.route.length - 1);
        }
        const segA = s.seg % s.route.length;
        const segB = (s.seg + 1) % s.route.length;
        const a = s.route[segA], b = s.route[segB];
        if (!a || !b) return;
        vanMarkers.current[i]?.setPosition({ lat: lerp(a.lat, b.lat, s.t), lng: lerp(a.lng, b.lng, s.t) });
      });
    };

    const interval = setInterval(tick, 80); // ~12fps
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [ready]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Actual Google Map */}
      <div ref={mapDivRef} className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(0)' }} />

      {/* Radar pulse canvas overlay */}
      {ready && <RadarOverlay />}

      {/* Dark vignette — keeps text readable but map visible */}
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.6) 30%, rgba(8,8,8,0.1) 55%, rgba(8,8,8,0.05) 100%),
          linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, rgba(8,8,8,0.0) 12%, rgba(8,8,8,0.0) 88%, rgba(8,8,8,0.7) 100%)
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
