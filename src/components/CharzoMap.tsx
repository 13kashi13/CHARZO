import React, { useEffect, useRef, useState, useCallback } from 'react';

import { loadGoogleMaps } from '../services/mapsLoader';

/* ─────────────────────────────────────────────
   Dark futuristic map style
───────────────────────────────────────────── */
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  // Clean light style
  { elementType: 'geometry',                                          stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.fill',                                  stylers: [{ color: '#444444' }] },
  { elementType: 'labels.text.stroke',                                stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.icon',                                       stylers: [{ visibility: 'off' }] },
  { featureType: 'road',            elementType: 'geometry',          stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',            elementType: 'geometry.stroke',   stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road',            elementType: 'labels.text.fill',  stylers: [{ color: '#666666' }] },
  { featureType: 'road',            elementType: 'labels.text.stroke',stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway',    elementType: 'geometry',          stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway',    elementType: 'geometry.stroke',   stylers: [{ color: '#c0c0c0' }] },
  { featureType: 'road.highway',    elementType: 'labels.text.fill',  stylers: [{ color: '#444444' }] },
  { featureType: 'road.highway',    elementType: 'labels.text.stroke',stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial',   elementType: 'geometry',          stylers: [{ color: '#eeeeee' }] },
  { featureType: 'road.local',      elementType: 'geometry',          stylers: [{ color: '#f8f8f8' }] },
  { featureType: 'water',           elementType: 'geometry',          stylers: [{ color: '#c9e8f5' }] },
  { featureType: 'water',           elementType: 'labels.text.fill',  stylers: [{ color: '#5b8fa8' }] },
  { featureType: 'poi',                                                stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',                                            stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative',  elementType: 'geometry',          stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#333333' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'landscape',       elementType: 'geometry',          stylers: [{ color: '#f0f0f0' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry',       stylers: [{ color: '#ebebeb' }] },
  { featureType: 'poi.park',        elementType: 'geometry',          stylers: [{ color: '#d4edda' }] },
];

/* ─────────────────────────────────────────────
   SVG markers
───────────────────────────────────────────── */
const USER_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
  <path d="M20 1C10.06 1 2 9.06 2 19c0 13.25 18 31 18 31s18-17.75 18-31C38 9.06 29.94 1 20 1z"
        fill="#063525" stroke="#00e5a0" stroke-width="1.8"/>
  <circle cx="20" cy="19" r="8" fill="#00e5a0" opacity="0.15"/>
  <path d="M22 12l-7 9h5l-2 7 8-10h-5l1-6z" fill="#00e5a0"/>
</svg>`;

const VAN_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
  <circle cx="17" cy="17" r="15" fill="#080808" stroke="#00e5a0" stroke-width="1.5"/>
  <rect x="7" y="12" width="12" height="9" rx="1.5" fill="none" stroke="#00e5a0" stroke-width="1.4"/>
  <path d="M19 15h5l2 5H19" fill="none" stroke="#00e5a0" stroke-width="1.4"/>
  <circle cx="11" cy="22" r="2" fill="#00e5a0"/>
  <circle cx="23" cy="22" r="2" fill="#00e5a0"/>
</svg>`;

const svgUrl = (svg: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const randomNearby = (lat: number, lng: number, radiusDeg: number) => ({
  // ensure minimum offset so vans never land exactly on the pin
  lat: lat + (Math.random() > 0.5 ? 1 : -1) * (radiusDeg * 0.4 + Math.random() * radiusDeg * 0.6),
  lng: lng + (Math.random() > 0.5 ? 1 : -1) * (radiusDeg * 0.4 + Math.random() * radiusDeg * 0.6),
});

const TOASTS = [
  '2 CHARZO vans detected nearby',
  'Charging support is minutes away',
  'Fast charging units found near you',
  '3 vans available in your area',
];

/* ─────────────────────────────────────────────
   Haversine distance (km) between two coords
───────────────────────────────────────────── */
const DELHI_CENTER = { lat: 28.6139, lng: 77.2090 };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Simulate ETA: base 12 min + 1.8 min per km from Delhi center, ±jitter, max 29 min */
function simulateEta(lat: number, lng: number): number {
  const dist = haversineKm(lat, lng, DELHI_CENTER.lat, DELHI_CENTER.lng);
  const base = 12 + dist * 1.8;
  const jitter = (Math.random() - 0.5) * 4;
  return Math.min(29, Math.max(8, Math.round(base + jitter)));
}

/** Shorten a place name to fit the pill */
function shortName(name: string): string {
  // Take first comma-separated segment, strip "India"
  const part = name.split(',')[0].trim();
  return part.length > 22 ? part.slice(0, 20) + '…' : part;
}
/* loadMaps — now uses shared singleton from mapsLoader.ts */
const loadMaps = loadGoogleMaps;

/* ─────────────────────────────────────────────
   Radar Canvas — sharp concentric rings
───────────────────────────────────────────── */
interface RadarProps { x: number; y: number; onDone: () => void; }

const RadarCanvas: React.FC<RadarProps> = ({ x, y, onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const RINGS = 4;
    const MAX_R = Math.min(W, H) * 0.38;
    const DURATION = 1800; // ms per ring
    const STAGGER  = 320;  // ms between rings
    const start = performance.now();

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);

      let anyAlive = false;
      for (let i = 0; i < RINGS; i++) {
        const t = (now - start - i * STAGGER) / DURATION;
        if (t < 0) { anyAlive = true; continue; }
        if (t > 1) continue;
        anyAlive = true;

        const r       = t * MAX_R;
        const opacity = 1 - t;           // linear fade
        const lw      = 1.8 * (1 - t * 0.5); // thinning stroke

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,229,160,${opacity.toFixed(3)})`;
        ctx.lineWidth   = lw;
        ctx.stroke();

        // inner bright ring (sharp edge)
        if (t < 0.5) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180,255,220,${(0.5 - t).toFixed(3)})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }

      // center dot
      const dotT = Math.min((now - start) / 300, 1);
      if (dotT > 0) {
        ctx.beginPath();
        ctx.arc(x, y, 4 * dotT, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5a0';
        ctx.fill();
        // tight glow only — 4px spread, not 20px
        ctx.shadowColor = '#00e5a0';
        ctx.shadowBlur  = 6;
        ctx.beginPath();
        ctx.arc(x, y, 3 * dotT, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (anyAlive) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
        onDone();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [x, y, onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export const CharzoMap: React.FC = () => {
  const mapDivRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const mapObj      = useRef<google.maps.Map | null>(null);
  const userPin     = useRef<google.maps.Marker | null>(null);
  const vanPins     = useRef<google.maps.Marker[]>([]);
  const autocomplete= useRef<google.maps.places.Autocomplete | null>(null);

  const [ready,    setReady]    = useState(false);
  const [toast,    setToast]    = useState<string | null>(null);
  const [radar,    setRadar]    = useState<{ x: number; y: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // ── Live status bar state ──
  const [coverage,  setCoverage]  = useState('Delhi NCR');
  const [eta,       setEta]       = useState('~25 min');
  const [vansCount, setVansCount] = useState('24 / 7');
  const [pulseKey,  setPulseKey]  = useState(0); // increment to re-trigger pulse

  const toastTimer  = useRef<ReturnType<typeof setTimeout>>();
  const geocoder    = useRef<google.maps.Geocoder | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  /* ── Init ── */
  useEffect(() => {
    if (!apiKey || !mapDivRef.current) return;
    loadMaps(apiKey).then(() => {
      if (!mapDivRef.current || mapObj.current) return;
      const map = new google.maps.Map(mapDivRef.current, {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 13,
        styles: MAP_STYLE,
        disableDefaultUI: true,
        gestureHandling: 'cooperative',
        backgroundColor: '#f5f5f5',
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapObj.current = map;
      geocoder.current = new google.maps.Geocoder();

      /* Autocomplete */
      if (inputRef.current) {
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['geometry', 'name'],
          componentRestrictions: { country: 'in' },
        });
        ac.bindTo('bounds', map);
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (!place.geometry?.location) return;
          map.panTo(place.geometry.location);
          map.setZoom(15);
          handlePin(place.geometry.location.lat(), place.geometry.location.lng(), place.name);
        });
        autocomplete.current = ac;
      }

      setReady(true);
    });
  }, [apiKey]);

  /* ── Clear vans ── */
  const clearVans = useCallback(() => {
    vanPins.current.forEach(m => m.setMap(null));
    vanPins.current = [];
  }, []);

  /* ── Show toast ── */
  const fireToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  /* ── Convert LatLng → canvas px ── */
  const latLngToPixel = useCallback((lat: number, lng: number): { x: number; y: number } | null => {
    const map = mapObj.current;
    const div = mapDivRef.current;
    if (!map || !div) return null;
    const proj   = map.getProjection();
    const bounds = map.getBounds();
    if (!proj || !bounds) return null;
    const ne    = bounds.getNorthEast();
    const sw    = bounds.getSouthWest();
    const neP   = proj.fromLatLngToPoint(ne)!;
    const swP   = proj.fromLatLngToPoint(sw)!;
    const scale = Math.pow(2, map.getZoom()!);
    const W     = div.offsetWidth;
    const H     = div.offsetHeight;
    const pt    = proj.fromLatLngToPoint(new google.maps.LatLng(lat, lng))!;
    return {
      x: ((pt.x - swP.x) * scale / ((neP.x - swP.x) * scale)) * W,
      y: ((pt.y - neP.y) * scale / ((swP.y - neP.y) * scale)) * H,
    };
  }, []);

  /* ── Update live status bar ── */
  const updateStatusBar = useCallback((lat: number, lng: number, placeName?: string) => {
    // 1. ETA — simulate based on distance, with a brief "calculating" flash
    const newEta = simulateEta(lat, lng);

    // 2. Coverage — use provided name or reverse-geocode
    const applyUpdate = (name: string) => {
      setCoverage(shortName(name));
      setEta(`~${newEta} min`);
      const count = 3 + Math.floor(Math.random() * 3);
      setVansCount(`${count} nearby`);
      setPulseKey(k => k + 1); // trigger glow pulse
    };

    if (placeName) {
      applyUpdate(placeName);
    } else if (geocoder.current) {
      geocoder.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          // Prefer locality > sublocality > formatted_address
          const locality =
            results[0].address_components?.find(c => c.types.includes('sublocality_level_1'))?.long_name ||
            results[0].address_components?.find(c => c.types.includes('locality'))?.long_name ||
            results[0].formatted_address;
          applyUpdate(locality || results[0].formatted_address);
        } else {
          applyUpdate('Selected Location');
        }
      });
    }
  }, []);

  /* ── Core pin + radar + vans logic ── */
  const handlePin = useCallback((lat: number, lng: number, placeName?: string) => {
    const map = mapObj.current;
    if (!map) return;

    /* User pin */
    if (userPin.current) {
      userPin.current.setPosition({ lat, lng });
    } else {
      userPin.current = new google.maps.Marker({
        position: { lat, lng }, map,
        icon: { url: svgUrl(USER_PIN_SVG), scaledSize: new google.maps.Size(40, 52), anchor: new google.maps.Point(20, 52) },
        zIndex: 10,
        animation: google.maps.Animation.DROP,
      });
    }

    /* Radar */
    requestAnimationFrame(() => {
      const px = latLngToPixel(lat, lng);
      if (px) setRadar(px);
    });

    /* Vans */
    clearVans();
    const count = 3 + Math.floor(Math.random() * 3); // 3–5 vans

    // Tier config: [radiusDeg, etaMin, etaMax]
    // Van 0 = closest (~30 min), rest = progressively farther
    const tiers = [
      { radius: 0.018, etaMin: 10, etaMax: 18 },  // closest  ~2 km
      { radius: 0.032, etaMin: 18, etaMax: 25 },  // mid      ~3.5 km
      { radius: 0.048, etaMin: 22, etaMax: 30 },  // far      ~5 km
      { radius: 0.062, etaMin: 25, etaMax: 35 },  // farther  ~7 km
      { radius: 0.078, etaMin: 28, etaMax: 38 },  // furthest ~8.5 km
    ];

    for (let i = 0; i < count; i++) {
      const tier = tiers[Math.min(i, tiers.length - 1)];
      const pos  = randomNearby(lat, lng, tier.radius);
      const eta  = tier.etaMin + Math.floor(Math.random() * (tier.etaMax - tier.etaMin));
      const m = new google.maps.Marker({
        position: pos, map,
        icon: { url: svgUrl(VAN_PIN_SVG), scaledSize: new google.maps.Size(34, 34), anchor: new google.maps.Point(17, 17) },
        zIndex: 5,
        animation: google.maps.Animation.DROP,
        title: `CHARZO Van · ~${eta} min`,
      });
      const iw = new google.maps.InfoWindow({
        content: `<div style="background:#0d0d0d;border:1px solid #00e5a0;border-radius:10px;padding:10px 14px;font-family:Inter,sans-serif;min-width:130px">
          <div style="color:#00e5a0;font-size:10px;font-weight:800;letter-spacing:.1em;margin-bottom:4px">CHARZO VAN</div>
          <div style="color:#fff;font-size:16px;font-weight:900">~${eta} min</div>
          <div style="color:#444;font-size:10px;margin-top:2px">Fast charging · All EVs</div>
        </div>`,
      });
      m.addListener('click', () => iw.open(map, m));
      vanPins.current.push(m);
    }

    /* Update status bar */
    updateStatusBar(lat, lng, placeName);

    /* Toast */
    fireToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
  }, [clearVans, fireToast, latLngToPixel, updateStatusBar]);

  /* ── Map click listener ── */
  useEffect(() => {
    if (!ready || !mapObj.current) return;
    const listener = mapObj.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      handlePin(e.latLng.lat(), e.latLng.lng());
    });
    return () => google.maps.event.removeListener(listener);
  }, [ready, handlePin]);

  /* ── Current location ── */
  const goToCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      fireToast('Geolocation not supported on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const map = mapObj.current;
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
        handlePin(lat, lng);
        setLocating(false);
      },
      () => {
        fireToast('Could not get your location');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [handlePin, fireToast]);

  return (
    <section id="map" className="bg-[#080808] py-0">
      {/* ── Header bar ── */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5a0] mb-3">Live Coverage Map</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              Click anywhere.<br />
              <span className="text-white/25">We're already nearby.</span>
            </h2>
          </div>
          <p className="text-sm text-white/30 max-w-xs leading-relaxed">
            Tap any location on the map to instantly detect nearby CHARZO charging vans in Delhi NCR.
          </p>
        </div>
      </div>

      {/* ── Map wrapper ── */}
      <div className="relative mx-0" style={{ height: '65vh', minHeight: '500px' }}>

        {/* Premium search bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
          <div id="poda" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

            {/* Dark border bg layer */}
            <div className="darkBorderBg" style={{
              maxHeight: '64px', maxWidth: '100%', width: '100%', height: '64px',
              position: 'absolute', overflow: 'hidden', zIndex: 0, borderRadius: '18px', filter: 'blur(3px)',
            }}>
              <div style={{
                content: '""', position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotate(82deg)',
                width: '600px', height: '600px',
                backgroundImage: 'conic-gradient(rgba(0,0,0,0), #18116a, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, #6e1b60, rgba(0,0,0,0) 60%)',
                transition: 'all 2s',
              }} />
            </div>

            {/* Border layer */}
            <div style={{
              maxHeight: '60px', maxWidth: 'calc(100% - 4px)', width: 'calc(100% - 4px)', height: '60px',
              position: 'absolute', overflow: 'hidden', zIndex: 0, borderRadius: '17px', filter: 'blur(0.5px)',
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotate(70deg)',
                width: '600px', height: '600px',
                backgroundImage: 'conic-gradient(#1c191c, #402fb5 5%, #1c191c 14%, #1c191c 50%, #00e5a0 60%, #1c191c 64%)',
                filter: 'brightness(1.3)', transition: 'all 2s',
              }} />
            </div>

            {/* White shimmer layer */}
            <div style={{
              maxHeight: '56px', maxWidth: 'calc(100% - 8px)', width: 'calc(100% - 8px)', height: '56px',
              position: 'absolute', overflow: 'hidden', zIndex: 0, borderRadius: '16px', filter: 'blur(2px)',
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotate(83deg)',
                width: '600px', height: '600px',
                backgroundImage: 'conic-gradient(rgba(0,0,0,0) 0%, #a099d8, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 50%, #00e5a0, rgba(0,0,0,0) 58%)',
                filter: 'brightness(1.4)', transition: 'all 2s',
              }} />
            </div>

            {/* Actual input */}
            <div id="main" style={{ position: 'relative', width: '100%', zIndex: 2 }}>
              {/* Search icon */}
              <svg
                id="search-icon"
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#00e5a0" strokeWidth="2"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>

              {/* Pink mask — left glow accent */}
              <div id="pink-mask" style={{
                pointerEvents: 'none', width: '30px', height: '20px',
                position: 'absolute', background: '#402fb5',
                top: '50%', transform: 'translateY(-50%)', left: '5px',
                filter: 'blur(20px)', opacity: 0.6, transition: 'all 2s',
              }} />

              <input
                ref={inputRef}
                type="text"
                placeholder="Search a location in Delhi NCR..."
                style={{
                  backgroundColor: '#010201',
                  border: 'none',
                  width: '100%',
                  height: '62px',
                  borderRadius: '16px',
                  color: 'white',
                  paddingLeft: '48px',
                  paddingRight: '20px',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
                onFocus={e => {
                  const mask = e.currentTarget.parentElement?.querySelector('#input-mask') as HTMLElement;
                  if (mask) mask.style.display = 'none';
                }}
              />

              {/* Input mask — right fade */}
              <div id="input-mask" style={{
                pointerEvents: 'none', width: '80px', height: '20px',
                position: 'absolute', background: 'linear-gradient(90deg, transparent, #010201)',
                top: '50%', transform: 'translateY(-50%)', right: '8px',
              }} />
            </div>
          </div>
        </div>

        {/* Map canvas */}
        <div ref={mapDivRef} className="w-full h-full" />

        {/* Current location button */}
        {ready && (
          <button
            onClick={goToCurrentLocation}
            disabled={locating}
            title="Use my current location"
            className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: 'rgba(0,0,0,0.82)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(66,196,152,0.25)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            {locating ? (
              /* Spinner */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round"
                   style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              /* Crosshair / location icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                <circle cx="12" cy="12" r="8" strokeOpacity="0.3"/>
              </svg>
            )}
          </button>
        )}

        {/* Radar canvas overlay */}
        {radar && (
          <RadarCanvas
            key={`${radar.x}-${radar.y}-${Date.now()}`}
            x={radar.x}
            y={radar.y}
            onDone={() => setRadar(null)}
          />
        )}

        {/* Loading state — honeycomb loader */}
        {!ready && (
          <div className="absolute inset-0 bg-[#080808] flex flex-col items-center justify-center gap-6 z-10">
            <div className="honeycomb-loader">
              {[0,1,2,3,4,5,6].map(i => <div key={i} />)}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">Initialising CHARZO Network</p>
          </div>
        )}

        {/* Tap hint — fades once user interacts */}
        {ready && !userPin.current && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="inline-flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/8 rounded-full px-4 py-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"/>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00e5a0]"/>
              </span>
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Tap map to detect vans</span>
            </div>
          </div>
        )}

        {/* Custom scroll hint — replaces Google's "Use Ctrl+scroll" */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none scroll-hint-overlay">
          <div className="inline-flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <path d="M12 2v20M5 9l7-7 7 7M5 15l7 7 7-7"/>
            </svg>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Scroll or pinch to zoom</span>
          </div>
        </div>
      </div>

      {/* ── Live status bar below map ── */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Coverage',     value: coverage,  live: true  },
            { label: 'Avg. Arrival', value: eta,       live: true  },
            { label: 'Vans Active',  value: vansCount, live: true  },
            { label: 'Charges Done', value: '100+',    live: false },
          ].map((s, i) => (
            <div
              key={i}
              className="stat-pill rounded-xl border px-4 py-3 flex items-center justify-between overflow-hidden relative"
              style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Pulse glow overlay — re-triggers on pulseKey change */}
              {s.live && (
                <span
                  key={pulseKey}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ animation: 'statPulse 0.7s ease-out forwards' }}
                />
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 relative z-10">
                {s.label}
              </span>
              <span
                key={s.live ? `${pulseKey}-${s.value}` : s.value}
                className="text-sm font-black text-[#00e5a0] relative z-10"
                style={s.live ? { animation: 'valueFlip 0.4s cubic-bezier(0.22,1,0.36,1) forwards' } : {}}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toast ── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        {toast && (
          <div
            key={toast}
            className="flex items-center gap-3 bg-black/90 backdrop-blur-xl border border-[#00e5a0]/50 rounded-2xl px-5 py-3 shadow-2xl"
            style={{
              animation: 'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
              boxShadow: '0 0 0 1px rgba(66,196,152,0.2), 0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-[#00e5a0] shrink-0" style={{ boxShadow: '0 0 6px #00e5a0' }}/>
            <svg width="11" height="11" viewBox="0 0 22 22" fill="none" className="shrink-0 opacity-60">
              <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/>
            </svg>
            <span className="text-sm font-bold text-white whitespace-nowrap">{toast}</span>
          </div>
        )}
      </div>

      <style>{`
        /* Honeycomb loader */
        @keyframes honeycomb {
          0%, 20%, 80%, 100% { opacity: 0; transform: scale(0); }
          30%, 70%            { opacity: 1; transform: scale(1); }
        }
        .honeycomb-loader {
          height: 48px;
          position: relative;
          width: 48px;
        }
        .honeycomb-loader div {
          animation: honeycomb 2.1s infinite backwards;
          background: #00e5a0;
          height: 24px;
          margin-top: 12px;
          position: absolute;
          width: 48px;
        }
        .honeycomb-loader div::after,
        .honeycomb-loader div::before {
          content: '';
          border-left: 24px solid transparent;
          border-right: 24px solid transparent;
          position: absolute;
          left: 0; right: 0;
        }
        .honeycomb-loader div::after  { top: -12px;  border-bottom: 12px solid #00e5a0; }
        .honeycomb-loader div::before { bottom: -12px; border-top: 12px solid #00e5a0; }
        .honeycomb-loader div:nth-child(1) { animation-delay: 0s;   left: -56px; top: 0; }
        .honeycomb-loader div:nth-child(2) { animation-delay: 0.1s; left: -28px; top: 44px; }
        .honeycomb-loader div:nth-child(3) { animation-delay: 0.2s; left:  28px; top: 44px; }
        .honeycomb-loader div:nth-child(4) { animation-delay: 0.3s; left:  56px; top: 0; }
        .honeycomb-loader div:nth-child(5) { animation-delay: 0.4s; left:  28px; top: -44px; }
        .honeycomb-loader div:nth-child(6) { animation-delay: 0.5s; left: -28px; top: -44px; }
        .honeycomb-loader div:nth-child(7) { animation-delay: 0.6s; left:   0px; top: 0; }
        #poda:hover .darkBorderBg > div { transform: translate(-50%, -50%) rotate(-98deg) !important; }
        #poda:hover .glow-layer > div   { transform: translate(-50%, -50%) rotate(-120deg) !important; }
        #poda:hover .border-layer > div { transform: translate(-50%, -50%) rotate(-110deg) !important; }
        #poda:hover .white-layer > div  { transform: translate(-50%, -50%) rotate(-97deg) !important; }
        #poda:focus-within .darkBorderBg > div { transform: translate(-50%, -50%) rotate(442deg) !important; transition: all 4s !important; }
        #poda:focus-within .border-layer > div { transform: translate(-50%, -50%) rotate(430deg) !important; transition: all 4s !important; }
        #poda:focus-within #main > #input-mask { display: none; }
        #poda:focus-within #pink-mask { opacity: 0 !important; }
        input::placeholder { color: rgba(192,185,192,0.4); }
        input:focus { outline: none; }
        @keyframes toastIn {
          from { opacity:0; transform:translate(-50%,10px) scale(0.96); }
          to   { opacity:1; transform:translate(-50%,0)    scale(1);    }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Hide Google's "Use Ctrl+scroll" / "Use ⌘+scroll" overlay entirely */
        .gm-style-mot { display: none !important; }
        .gm-style-mot-container { display: none !important; }
        /* Also hide via the actual class Google uses */
        .dismissButton { display: none !important; }
        div[class="gm-style-mot"] { display: none !important; }
        /* The cooperative gesture overlay */
        .gm-style > div > div > div > div[style*="background-color: rgba(0, 0, 0, 0.5)"] {
          display: none !important;
        }
        /* Stat pill green glow pulse on update */
        @keyframes statPulse {
          0%   { background: rgba(0,229,160,0.18); }
          60%  { background: rgba(0,229,160,0.06); }
          100% { background: rgba(0,229,160,0);    }
        }
        /* Value flip-in on update */
        @keyframes valueFlip {
          0%   { opacity:0; transform: translateY(6px); }
          100% { opacity:1; transform: translateY(0);   }
        }
        /* Strip Google InfoWindow chrome */
        .gm-style .gm-style-iw-c {
          background: transparent !important;
          border-radius: 12px !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .gm-style .gm-style-iw-d {
          overflow: hidden !important;
          padding: 0 !important;
        }
        .gm-style .gm-style-iw-t::after {
          display: none !important;
        }
        .gm-style .gm-style-iw-tc {
          display: none !important;
        }
        .gm-style-iw-chr {
          display: none !important;
        }
        .gm-ui-hover-effect {
          display: none !important;
        }
      `}</style>
    </section>
  );
};
