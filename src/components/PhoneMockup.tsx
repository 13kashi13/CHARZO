import React, { useState, useEffect, useRef } from 'react';

/* ─── Types ─── */
type Screen = 'home' | 'booking' | 'tracking' | 'history';
type BookingStep = 1 | 2 | 3;

/* ─── Live clock ─── */
function useClock() {
  const [time, setTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  });
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setTime(d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 10000);
    return () => clearInterval(t);
  }, []);
  return time;
}

/* ─── Battery animation (78→100 while on tracking screen) ─── */
function useBattery(active: boolean) {
  const [pct, setPct] = useState(78);
  useEffect(() => {
    if (!active) { setPct(78); return; }
    const t = setInterval(() => setPct(p => p >= 100 ? 100 : p + 1), 800);
    return () => clearInterval(t);
  }, [active]);
  return pct;
}

/* ─── iOS Status Bar ─── */
const StatusBar: React.FC<{ time: string; battery: number }> = ({ time, battery }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', height: '44px', flexShrink: 0,
  }}>
    {/* Time — left */}
    <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', minWidth: '48px' }}>
      {time}
    </span>
    {/* Dynamic Island spacer */}
    <div style={{ width: '126px' }} />
    {/* Right icons */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '48px', justifyContent: 'flex-end' }}>
      {/* Signal bars */}
      <div style={{ display: 'flex', gap: '1.5px', alignItems: 'flex-end' }}>
        {[3, 5, 7, 9].map((h, i) => (
          <div key={i} style={{
            width: '3px', height: `${h}px`,
            background: i < 3 ? '#fff' : 'rgba(255,255,255,0.3)',
            borderRadius: '1px',
          }} />
        ))}
      </div>
      {/* WiFi */}
      <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
        <path d="M7.5 8.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="white"/>
        <path d="M4.5 6.5C5.4 5.6 6.4 5 7.5 5s2.1.6 3 1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
        <path d="M1.5 3.5C3.2 1.8 5.2 1 7.5 1s4.3.8 6 2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
      </svg>
      {/* Battery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
        <div style={{
          width: '25px', height: '12px', borderRadius: '3px',
          border: '1px solid rgba(255,255,255,0.35)',
          padding: '1.5px', display: 'flex', alignItems: 'center',
        }}>
          <div style={{
            height: '100%', borderRadius: '1.5px',
            width: `${battery}%`,
            background: battery > 20 ? '#00e5a0' : '#ff3b30',
            transition: 'width 0.8s ease',
          }} />
        </div>
        <div style={{ width: '2px', height: '5px', background: 'rgba(255,255,255,0.35)', borderRadius: '0 1px 1px 0' }} />
      </div>
    </div>
  </div>
);

/* ─── Dynamic Island ─── */
const DynamicIsland: React.FC<{ charging?: boolean }> = ({ charging }) => (
  <div style={{
    position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
    width: charging ? '160px' : '126px', height: '37px',
    background: '#000',
    borderRadius: '20px',
    zIndex: 30,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1)',
    boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.6)',
  }}>
    {charging ? (
      <>
        <div style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#00e5a0', boxShadow: '0 0 8px #00e5a0',
          animation: 'di-ping 1.5s infinite',
        }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#00e5a0', letterSpacing: '0.06em' }}>CHARGING</span>
      </>
    ) : (
      <>
        {/* Camera dot */}
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#1a1a1a',
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.06), 0 0 0 1px rgba(0,229,160,0.08)',
        }} />
        {/* Face ID sensor */}
        <div style={{
          width: '14px', height: '14px', borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </>
    )}
  </div>
);

/* ─── HOME SCREEN ─── */
const HomeScreen: React.FC<{ onBook: () => void; onTrack: () => void }> = ({ onBook, onTrack }) => (
  <div style={{ padding: '0 0 8px 0', overflowY: 'auto', maxHeight: '520px' }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px' }}>
      <div>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Good morning</p>
        <p style={{ fontSize: '17px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}>CHARZO</p>
      </div>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%',
        background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
          <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/>
        </svg>
      </div>
    </div>

    {/* Quick action card */}
    <div style={{
      margin: '0 12px 12px', borderRadius: '16px',
      background: 'linear-gradient(135deg, #063525 0%, #0a1f15 100%)',
      border: '1px solid rgba(0,229,160,0.25)', padding: '16px', cursor: 'pointer',
    }} onClick={onBook}>
      <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(0,229,160,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 6px' }}>Quick Charge</p>
      <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>Request a van now</p>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 14px' }}>3 vans available · ~25 min away</p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: '#00e5a0', borderRadius: '8px', padding: '8px 12px', width: 'fit-content',
      }}>
        <svg width="10" height="10" viewBox="0 0 22 22" fill="none"><path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="black"/></svg>
        <span style={{ fontSize: '10px', fontWeight: 900, color: '#000' }}>Book Now</span>
      </div>
    </div>

    {/* Active session banner */}
    <div style={{
      margin: '0 12px 12px', borderRadius: '12px',
      background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.15)',
      padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
    }} onClick={onTrack}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 6px #00e5a0', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', margin: 0 }}>Van on the way</p>
          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Tap to track live</p>
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,160,0.6)" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </div>

    {/* Stats row */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '0 12px 12px' }}>
      {[
        { label: 'Total Charges', value: '12' },
        { label: 'kWh Delivered', value: '184' },
        { label: 'Avg. ETA', value: '23 min' },
        { label: 'CO₂ Saved', value: '42 kg' },
      ].map((s, i) => (
        <div key={i} style={{
          borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)', padding: '10px',
        }}>
          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>{s.label}</p>
          <p style={{ fontSize: '16px', fontWeight: 900, color: '#00e5a0', margin: 0 }}>{s.value}</p>
        </div>
      ))}
    </div>

    {/* Recent activity */}
    <div style={{ margin: '0 12px' }}>
      <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>Recent</p>
      {[
        { loc: 'Sector 62, Noida', date: 'Today', kwh: '18 kWh' },
        { loc: 'Connaught Place', date: 'Yesterday', kwh: '22 kWh' },
      ].map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 0', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 22 22" fill="none"><path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/></svg>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#fff', margin: 0 }}>{r.loc}</p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{r.date} · {r.kwh}</p>
            </div>
          </div>
          <span style={{
            fontSize: '8px', fontWeight: 700, color: '#00e5a0',
            background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)',
            borderRadius: '4px', padding: '2px 6px', textTransform: 'uppercase',
          }}>Done</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── BOOKING SCREEN ─── */
const BookingScreen: React.FC<{ onConfirm: () => void; onBack: () => void }> = ({ onConfirm, onBack }) => {
  const [step, setStep] = useState<BookingStep>(1);
  const [vehicle, setVehicle] = useState('');
  const [chargeType, setChargeType] = useState('');

  const vehicles = ['2 Wheeler EV', '3 Wheeler EV', '4 Wheeler EV'];
  const chargeTypes = ['Fast Charge (DC)', 'Overnight Plan'];

  return (
    <div style={{ padding: '0 0 8px', overflowY: 'auto', maxHeight: '520px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px 14px' }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', width: '28px', height: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff', margin: 0 }}>Book a Charge</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px 16px' }}>
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: step >= s ? '#00e5a0' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${step >= s ? '#00e5a0' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}>
              <span style={{ fontSize: '9px', fontWeight: 900, color: step >= s ? '#000' : 'rgba(255,255,255,0.3)' }}>{s}</span>
            </div>
            {s < 3 && <div style={{ flex: 1, height: '1px', background: step > s ? '#00e5a0' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s ease' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Vehicle */}
      {step === 1 && (
        <div style={{ padding: '0 12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>Select your vehicle</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {vehicles.map(v => (
              <div key={v} onClick={() => setVehicle(v)} style={{
                padding: '11px 14px', borderRadius: '10px',
                background: vehicle === v ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${vehicle === v ? 'rgba(0,229,160,0.4)' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: vehicle === v ? '#00e5a0' : 'rgba(255,255,255,0.6)' }}>{v}</span>
                {vehicle === v && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#00e5a0"/>
                    <path d="M8 12l3 3 5-5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => vehicle && setStep(2)} style={{
            marginTop: '14px', width: '100%', height: '38px', borderRadius: '10px',
            background: vehicle ? '#00e5a0' : 'rgba(255,255,255,0.06)', border: 'none',
            cursor: vehicle ? 'pointer' : 'default', fontSize: '11px', fontWeight: 900,
            color: vehicle ? '#000' : 'rgba(255,255,255,0.2)', transition: 'all 0.2s ease',
          }}>Continue</button>
        </div>
      )}

      {/* Step 2: Charge type */}
      {step === 2 && (
        <div style={{ padding: '0 12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>Choose charge type</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {chargeTypes.map((c, i) => (
              <div key={c} onClick={() => setChargeType(c)} style={{
                padding: '11px 14px', borderRadius: '10px',
                background: chargeType === c ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${chargeType === c ? 'rgba(0,229,160,0.4)' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: chargeType === c ? '#00e5a0' : 'rgba(255,255,255,0.6)' }}>{c}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: chargeType === c ? '#00e5a0' : 'rgba(255,255,255,0.2)' }}>{['₹22/kWh', '₹18/kWh'][i]}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, height: '38px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            }}>Back</button>
            <button onClick={() => chargeType && setStep(3)} style={{
              flex: 2, height: '38px', borderRadius: '10px',
              background: chargeType ? '#00e5a0' : 'rgba(255,255,255,0.06)', border: 'none',
              cursor: chargeType ? 'pointer' : 'default', fontSize: '11px', fontWeight: 900,
              color: chargeType ? '#000' : 'rgba(255,255,255,0.2)', transition: 'all 0.2s ease',
            }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div style={{ padding: '0 12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>Confirm booking</p>
          <div style={{
            borderRadius: '12px', background: 'rgba(0,229,160,0.05)',
            border: '1px solid rgba(0,229,160,0.15)', padding: '14px', marginBottom: '10px',
          }}>
            {[
              { label: 'Vehicle', value: vehicle },
              { label: 'Charge Type', value: chargeType },
              { label: 'Location', value: 'Current Location' },
              { label: 'Est. Arrival', value: '~25 min' },
              { label: 'Vans Available', value: '3 nearby' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '5px 0',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{r.label}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setStep(2)} style={{
              flex: 1, height: '38px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            }}>Back</button>
            <button onClick={onConfirm} style={{
              flex: 2, height: '38px', borderRadius: '10px',
              background: '#00e5a0', border: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: 900, color: '#000',
            }}>Confirm Booking</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Mini Google Map inside phone ─── */
const TrackingMap: React.FC<{ vanLng: number; eta: number; arrived: boolean }> = ({ vanLng, eta, arrived }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<google.maps.Map | null>(null);
  const vanMarker = useRef<google.maps.Marker | null>(null);
  const routePolyline = useRef<google.maps.Polyline | null>(null);
  const fullRoutePath = useRef<google.maps.LatLng[]>([]);
  const initialized = useRef(false);

  const USER_POS  = { lat: 28.6280, lng: 77.2190 }; // Connaught Place
  const VAN_START = { lat: 28.6200, lng: 77.1700 }; // Rajouri Garden

  const progress = Math.min(vanLng, 1);
  const vanPos = {
    lat: VAN_START.lat + (USER_POS.lat - VAN_START.lat) * progress,
    lng: VAN_START.lng + (USER_POS.lng - VAN_START.lng) * progress,
  };

  // Init map once Google is ready
  useEffect(() => {
    const tryInit = () => {
      if (initialized.current || !mapRef.current) return;
      if (!(window as any).google?.maps) return;
      initialized.current = true;

      const mapStyles: google.maps.MapTypeStyle[] = [
        { elementType: 'geometry',                           stylers: [{ color: '#0a0a0a' }] },
        { elementType: 'labels',                             stylers: [{ visibility: 'off' }] },
        { featureType: 'road.local',       elementType: 'geometry',        stylers: [{ color: '#1c1c1c' }] },
        { featureType: 'road.arterial',    elementType: 'geometry',        stylers: [{ color: '#2a2a2a' }] },
        { featureType: 'road.arterial',    elementType: 'geometry.stroke', stylers: [{ color: '#111' }] },
        { featureType: 'road.highway',     elementType: 'geometry',        stylers: [{ color: '#3a3a3a' }] },
        { featureType: 'road.highway',     elementType: 'geometry.stroke', stylers: [{ color: '#222' }] },
        { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#444' }] },
        { featureType: 'water',            elementType: 'geometry',        stylers: [{ color: '#050505' }] },
        { featureType: 'poi',                                               stylers: [{ visibility: 'off' }] },
        { featureType: 'transit',                                           stylers: [{ visibility: 'off' }] },
        { featureType: 'landscape',        elementType: 'geometry',        stylers: [{ color: '#0a0a0a' }] },
        { featureType: 'landscape.man_made', elementType: 'geometry',      stylers: [{ color: '#0f0f0f' }] },
        { featureType: 'administrative',   elementType: 'geometry',        stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.park',         elementType: 'geometry',        stylers: [{ color: '#080808' }] },
      ];

      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 28.624, lng: 77.194 },
        zoom: 12,
        disableDefaultUI: true,
        gestureHandling: 'none',
        zoomControl: false,
        styles: mapStyles,
      });
      mapObj.current = map;

      // Van marker — smaller, cleaner
      vanMarker.current = new google.maps.Marker({
        position: VAN_START, map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#00e5a0" stroke="#fff" stroke-width="2"/><rect x="6" y="10" width="9" height="7" rx="1.5" fill="none" stroke="#000" stroke-width="1.4"/><path d="M15 12h4l1.5 4H15" fill="none" stroke="#000" stroke-width="1.4"/><circle cx="9" cy="18" r="1.8" fill="#000"/><circle cx="17.5" cy="18" r="1.8" fill="#000"/></svg>')}`,
          scaledSize: new google.maps.Size(28, 28),
          anchor: new google.maps.Point(14, 14),
        },
        zIndex: 20,
      });

      // User pin — smaller teardrop
      new google.maps.Marker({
        position: USER_POS, map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path d="M12 1C6.48 1 2 5.48 2 11c0 7.5 10 20 10 20s10-12.5 10-20C22 5.48 17.52 1 12 1z" fill="#00e5a0" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="11" r="4.5" fill="#fff"/><circle cx="12" cy="11" r="2.5" fill="#00e5a0"/></svg>')}`,
          scaledSize: new google.maps.Size(24, 32),
          anchor: new google.maps.Point(12, 32),
        },
        zIndex: 10,
      });

      // Try Directions API first — follows real roads
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: '#00e5a0',
          strokeWeight: 4,
          strokeOpacity: 1,
          zIndex: 99,
        },
      });

      directionsService.route(
        {
          origin: new google.maps.LatLng(VAN_START.lat, VAN_START.lng),
          destination: new google.maps.LatLng(USER_POS.lat, USER_POS.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            // Extract all points from the route
            const path = result.routes[0].overview_path;
            fullRoutePath.current = path;
            routePolyline.current = new google.maps.Polyline({
              path,
              map,
              strokeColor: '#00e5a0',
              strokeWeight: 3,
              strokeOpacity: 1,
              zIndex: 99,
            });
          } else {
            // Realistic fallback path through Delhi streets
            const fallbackCoords = [
              { lat: 28.6200, lng: 77.1700 },
              { lat: 28.6215, lng: 77.1745 },
              { lat: 28.6248, lng: 77.1810 },
              { lat: 28.6272, lng: 77.1868 },
              { lat: 28.6305, lng: 77.1920 },
              { lat: 28.6318, lng: 77.1975 },
              { lat: 28.6308, lng: 77.2040 },
              { lat: 28.6295, lng: 77.2095 },
              { lat: 28.6285, lng: 77.2145 },
              { lat: 28.6280, lng: 77.2190 },
            ];
            fullRoutePath.current = fallbackCoords.map(c => new google.maps.LatLng(c.lat, c.lng));
            routePolyline.current = new google.maps.Polyline({
              path: fullRoutePath.current,
              map,
              strokeColor: '#00e5a0',
              strokeWeight: 3,
              strokeOpacity: 1,
              zIndex: 99,
            });
          }
        }
      );
    };

    // Try immediately, then poll until Maps is loaded
    tryInit();
    const poll = setInterval(() => {
      if (initialized.current) { clearInterval(poll); return; }
      tryInit();
    }, 300);
    return () => clearInterval(poll);
  }, []);

  // Smoothly move van marker and trim route as progress updates
  useEffect(() => {
    if (vanMarker.current) {
      vanMarker.current.setPosition(vanPos);
    }
    // Trim route — show only remaining path from van's current position onward
    if (routePolyline.current && fullRoutePath.current.length > 0) {
      const total = fullRoutePath.current.length;
      const startIdx = Math.floor(progress * (total - 1));
      const remaining = fullRoutePath.current.slice(startIdx);
      routePolyline.current.setPath([vanPos, ...remaining]);
    }
  }, [vanLng]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

/* ─── TRACKING SCREEN ─── */
const TrackingScreen: React.FC<{ battery: number; onDone: () => void }> = ({ battery, onDone }) => {
  const [vanX, setVanX] = useState(18);
  const [eta, setEta] = useState(25);

  useEffect(() => {
    const t = setInterval(() => {
      setVanX(x => { const next = x + 0.08; return next > 58 ? 58 : next; });
      setEta(e => e > 0 ? e - 1 : 0);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const arrived = vanX >= 58;

  return (
    /* Snapchat-style: map fills entire screen, UI overlays float on top */
    <div style={{ position: 'relative', height: '520px', overflow: 'hidden', background: '#0a0a0a' }}>

      {/* ── Full-screen Google Map ── */}
      <TrackingMap vanLng={vanX / 58} eta={eta} arrived={arrived} />

      {/* ── Top overlay: header ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: '10px 14px 8px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live Tracking</p>
            <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Van on the way</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.4)',
            borderRadius: '20px', padding: '4px 10px', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 6px #00e5a0' }} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#00e5a0', letterSpacing: '0.1em' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Bottom sheet overlay ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px 20px 0 0',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 14px 12px',
      }}>
        {/* Drag handle */}
        <div style={{ width: '32px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 10px' }} />

        {/* Van info row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2">
                <rect x="1" y="8" width="15" height="10" rx="2"/><path d="M16 12h4l2 4H16"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff', margin: 0 }}>CHARZO Van #CZ-04</p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Rajesh K. · ⭐ 4.9</p>
            </div>
          </div>
          <button style={{
            background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)',
            borderRadius: '8px', padding: '5px 12px', cursor: 'pointer',
            fontSize: '10px', fontWeight: 700, color: '#00e5a0',
          }}>Call</button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
          {[
            { label: 'ETA', value: arrived ? 'Here!' : `~${eta} min`, accent: true },
            { label: 'Battery', value: `${battery}%`, accent: false },
            { label: 'Status', value: arrived ? 'Charging' : 'En route', accent: true },
          ].map((s, i) => (
            <div key={i} style={{
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '7px 8px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px' }}>{s.label}</p>
              <p style={{ fontSize: '13px', fontWeight: 900, color: s.accent ? '#00e5a0' : '#fff', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Battery bar */}
        <div style={{ marginBottom: arrived ? '8px' : '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Battery Level</span>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>Est. full in {Math.round((100 - battery) * 0.8)} min</span>
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #00e5a0, #00c87a)', width: `${battery}%`, transition: 'width 0.8s ease' }}/>
          </div>
        </div>

        {arrived && (
          <button onClick={onDone} style={{
            width: '100%', height: '36px', borderRadius: '10px',
            background: '#00e5a0', border: 'none', cursor: 'pointer',
            fontSize: '11px', fontWeight: 900, color: '#000', marginTop: '4px',
          }}>
            Charging Complete ✓
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── HISTORY SCREEN ─── */
const HistoryScreen: React.FC = () => {
  const sessions = [
    { loc: 'Sector 62, Noida', date: 'Today, 9:14 AM', kwh: '18 kWh', cost: '₹396', duration: '52 min' },
    { loc: 'Connaught Place, Delhi', date: 'Yesterday, 6:30 PM', kwh: '22 kWh', cost: '₹484', duration: '64 min' },
    { loc: 'Cyber City, Gurugram', date: '28 Apr, 11:00 AM', kwh: '15 kWh', cost: '₹270', duration: '44 min' },
    { loc: 'Noida Sector 18', date: '26 Apr, 8:45 AM', kwh: '20 kWh', cost: '₹360', duration: '58 min' },
  ];

  return (
    <div style={{ padding: '0 0 8px', overflowY: 'auto', maxHeight: '520px' }}>
      <div style={{ padding: '8px 16px 14px' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Your sessions</p>
        <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff', margin: 0 }}>Charge History</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', margin: '0 12px 14px' }}>
        {[{ label: 'Sessions', value: '12' }, { label: 'Total kWh', value: '184' }, { label: 'Spent', value: '₹3.2k' }].map((s, i) => (
          <div key={i} style={{ borderRadius: '10px', background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.12)', padding: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 900, color: '#00e5a0', margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 12px' }}>
        <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>All Sessions</p>
        {sessions.map((s, i) => (
          <div key={i} style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 12px', marginBottom: '7px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', margin: 0 }}>{s.loc}</p>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{s.date}</p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#00e5a0' }}>{s.cost}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[s.kwh, s.duration].map((tag, j) => (
                <span key={j} style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '2px 6px' }}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── BOTTOM NAV ─── */
const BottomNav: React.FC<{ active: Screen; onChange: (s: Screen) => void }> = ({ active, onChange }) => {
  const tabs: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'booking', label: 'Book', icon: <svg width="14" height="14" viewBox="0 0 22 22" fill="none"><path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
    { id: 'tracking', label: 'Track', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg> },
    { id: 'history', label: 'History', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '8px 8px 4px', borderTop: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)',
    }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
          borderRadius: '8px', transition: 'all 0.2s ease',
          color: active === tab.id ? '#00e5a0' : 'rgba(255,255,255,0.2)',
        }}>
          {tab.icon}
          <span style={{ fontSize: '8px', fontWeight: active === tab.id ? 700 : 500 }}>{tab.label}</span>
          {active === tab.id && <div style={{ width: '16px', height: '2px', borderRadius: '1px', background: '#00e5a0' }}/>}
        </button>
      ))}
    </div>
  );
};

/* ─── TITANIUM BUTTON STYLE ─── */
const titaniumGradient = 'linear-gradient(145deg, #8a8a8a, #5a5a5a, #8a8a8a)';

/* ─── MAIN PHONE COMPONENT ─── */
export const PhoneMockup: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const time = useClock();
  const battery = useBattery(screen === 'tracking');

  const handleConfirmBooking = () => setScreen('tracking');
  const handleDone = () => setScreen('history');

  return (
    <div className="relative flex justify-center items-center h-full select-none" style={{ overflow: 'visible' }}>

      {/* ── Ambient glow behind phone ── */}
      <div style={{
        position: 'absolute',
        width: '280px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,229,160,0.07) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Phone wrapper (handles side buttons) ── */}
      <div className="relative z-10" style={{ width: '320px' }}>

        {/* ── Titanium frame outer shell ── */}
        <div style={{
          position: 'relative',
          width: '320px',
          height: '693px',
          borderRadius: '3rem',
          background: titaniumGradient,
          /* Outer glow + frame reflection */
          boxShadow: [
            '0 0 0 1px rgba(255,255,255,0.15)',
            '0 40px 80px rgba(0,0,0,0.8)',
            '0 0 60px rgba(0,229,160,0.08)',
            'inset 0 1px 0 rgba(255,255,255,0.25)',
          ].join(', '),
          padding: '3px', /* frame thickness */
        }}>

          {/* ── Antenna lines — top of frame ── */}
          <div style={{
            position: 'absolute', top: '72px', left: 0, right: 0,
            height: '1px', background: 'rgba(0,0,0,0.35)', zIndex: 40,
          }} />
          <div style={{
            position: 'absolute', bottom: '72px', left: 0, right: 0,
            height: '1px', background: 'rgba(0,0,0,0.35)', zIndex: 40,
          }} />

          {/* ── Inner screen bezel (2px inset from frame) ── */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: 'calc(3rem - 3px)',
            background: '#080808',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}>

            {/* ── Screen glass sheen overlay ── */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%)',
              borderRadius: 'calc(3rem - 3px)',
            }} />

            {/* ── Dynamic Island ── */}
            <DynamicIsland charging={screen === 'tracking' && battery > 78} />

            {/* ── Status bar ── */}
            <StatusBar time={time} battery={battery} />

            {/* ── Screen content ── */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <div style={{ animation: 'screenIn 0.25s ease forwards' }} key={screen}>
                {screen === 'home'     && <HomeScreen onBook={() => setScreen('booking')} onTrack={() => setScreen('tracking')} />}
                {screen === 'booking'  && <BookingScreen onConfirm={handleConfirmBooking} onBack={() => setScreen('home')} />}
                {screen === 'tracking' && <TrackingScreen battery={battery} onDone={handleDone} />}
                {screen === 'history'  && <HistoryScreen />}
              </div>
            </div>

            {/* ── Bottom nav ── */}
            <BottomNav active={screen} onChange={setScreen} />

            {/* ── iOS home indicator ── */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 10px', background: 'rgba(8,8,8,0.95)' }}>
              <div style={{ width: '120px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.2)' }}/>
            </div>
          </div>
        </div>

        {/* ── Side buttons — titanium gradient ── */}

        {/* Power button — right side */}
        <div style={{
          position: 'absolute', right: '-3px', top: '160px',
          width: '3px', height: '80px',
          borderRadius: '0 2px 2px 0',
          background: titaniumGradient,
          boxShadow: '2px 0 4px rgba(0,0,0,0.5)',
        }} />

        {/* Silent switch — left side */}
        <div style={{
          position: 'absolute', left: '-3px', top: '110px',
          width: '3px', height: '32px',
          borderRadius: '2px 0 0 2px',
          background: titaniumGradient,
          boxShadow: '-2px 0 4px rgba(0,0,0,0.5)',
        }} />

        {/* Volume up — left side */}
        <div style={{
          position: 'absolute', left: '-3px', top: '162px',
          width: '3px', height: '64px',
          borderRadius: '2px 0 0 2px',
          background: titaniumGradient,
          boxShadow: '-2px 0 4px rgba(0,0,0,0.5)',
        }} />

        {/* Volume down — left side */}
        <div style={{
          position: 'absolute', left: '-3px', top: '240px',
          width: '3px', height: '64px',
          borderRadius: '2px 0 0 2px',
          background: titaniumGradient,
          boxShadow: '-2px 0 4px rgba(0,0,0,0.5)',
        }} />
      </div>

      {/* ── Floating stats ── */}
      <div style={{ position: 'absolute', top: '40px', right: '-160px', zIndex: 20 }}
           className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl px-5 py-3.5 shadow-xl">
        <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Vans nearby</p>
        <p className="text-2xl font-black text-white">3 <span className="text-[#00e5a0] text-base font-bold">active</span></p>
      </div>
      <div style={{ position: 'absolute', bottom: '80px', left: '-160px', zIndex: 20 }}
           className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl px-5 py-3.5 shadow-xl">
        <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Avg. arrival</p>
        <p className="text-2xl font-black text-[#00e5a0]">~25 min</p>
      </div>

      <style>{`
        @keyframes screenIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ring-pulse {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes di-ping {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};
