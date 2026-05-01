import React, { useState, useEffect } from 'react';

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

/* ─── TRACKING SCREEN ─── */
const TrackingScreen: React.FC<{ battery: number; onDone: () => void }> = ({ battery, onDone }) => {
  const [vanX, setVanX] = useState(18);
  const [eta, setEta] = useState(25);

  useEffect(() => {
    const t = setInterval(() => {
      setVanX(x => { const next = x + 0.4; return next > 58 ? 58 : next; });
      setEta(e => e > 0 ? e - 1 : 0);
    }, 600);
    return () => clearInterval(t);
  }, []);

  const arrived = vanX >= 58;

  return (
    <div style={{ padding: '0 0 8px', overflowY: 'auto', maxHeight: '520px' }}>
      {/* Header */}
      <div style={{ padding: '8px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Live Tracking</p>
          <p style={{ fontSize: '14px', fontWeight: 900, color: '#fff', margin: 0 }}>Van on the way</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)',
          borderRadius: '20px', padding: '4px 10px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e5a0', animation: 'di-ping 1.5s infinite' }} />
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#00e5a0' }}>LIVE</span>
        </div>
      </div>

      {/* Map */}
      <div style={{ position: 'relative', height: '170px', background: '#0d0d0d', overflow: 'hidden', margin: '0 0 10px' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
          {[0,25,50,75,100,125,150,175].map(y => <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#1e1e1e" strokeWidth="1"/>)}
          {[0,35,70,105,140,175,210,245,280,315].map(x => <line key={x} x1={x} y1="0" x2={x} y2="170" stroke="#1e1e1e" strokeWidth="1"/>)}
          <line x1="0" y1="85" x2="320" y2="85" stroke="#1a1a1a" strokeWidth="10"/>
          <line x1="0" y1="85" x2="320" y2="85" stroke="#222" strokeWidth="8"/>
          {[10,50,90,130,170,210,250].map(x => <line key={x} x1={x} y1="85" x2={x+25} y2="85" stroke="#2a2a2a" strokeWidth="1.5" strokeDasharray="10 8"/>)}
        </svg>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <path d={`M${vanX}% 85 Q 40% 60 62% 40`} stroke="#00e5a0" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.5"/>
        </svg>
        {/* Animated van */}
        <div style={{
          position: 'absolute', top: '50%', left: `${vanX}%`,
          transform: 'translate(-50%, -50%)', transition: 'left 0.6s linear', zIndex: 10,
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', background: '#00e5a0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px rgba(0,229,160,0.6)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
              <rect x="1" y="8" width="15" height="10" rx="2"/>
              <path d="M16 12h4l2 4H16"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          {!arrived && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #00e5a0', opacity: 0.4, animation: 'ring-pulse 2s ease-out infinite' }}/>}
        </div>
        {/* User pin */}
        <div style={{ position: 'absolute', top: '22%', left: '62%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#080808' }}/>
          </div>
        </div>
        {/* ETA chip */}
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(13,13,13,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 8px' }}>
          <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>ETA</p>
          <p style={{ fontSize: '12px', fontWeight: 900, color: arrived ? '#00e5a0' : '#fff', margin: 0 }}>{arrived ? 'Here!' : `~${eta} min`}</p>
        </div>
      </div>

      {/* Battery card */}
      <div style={{ margin: '0 12px 10px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Battery</p>
            <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>{battery}%</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', marginTop: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 6px #00e5a0' }}/>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00e5a0' }}>{arrived ? 'Charging' : 'Waiting'}</span>
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #00e5a0, #00c87a)', width: `${battery}%`, transition: 'width 0.8s ease' }}/>
        </div>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', margin: '6px 0 0' }}>Est. full charge in {Math.round((100 - battery) * 0.8)} min</p>
      </div>

      {/* Van info */}
      <div style={{ margin: '0 12px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2">
              <rect x="1" y="8" width="15" height="10" rx="2"/><path d="M16 12h4l2 4H16"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', margin: 0 }}>CHARZO Van #CZ-04</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Rajesh K. · ⭐ 4.9</p>
          </div>
        </div>
        <button style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '9px', fontWeight: 700, color: '#00e5a0' }}>Call</button>
      </div>

      {arrived && (
        <div style={{ margin: '0 12px' }}>
          <button onClick={onDone} style={{ width: '100%', height: '38px', borderRadius: '10px', background: '#00e5a0', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 900, color: '#000' }}>
            Charging Complete ✓
          </button>
        </div>
      )}
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
    <div className="relative flex justify-center items-center h-full select-none">

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
      <div className="absolute top-6 -right-2 lg:-right-8 bg-[#0d0d0d] border border-white/[0.08] rounded-2xl px-5 py-3.5 shadow-xl">
        <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Vans nearby</p>
        <p className="text-2xl font-black text-white">3 <span className="text-[#00e5a0] text-base font-bold">active</span></p>
      </div>
      <div className="absolute bottom-10 -left-2 lg:-left-8 bg-[#0d0d0d] border border-white/[0.08] rounded-2xl px-5 py-3.5 shadow-xl">
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
