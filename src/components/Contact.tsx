import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { GlowButton } from './GlowButton';

export const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', phone: '', vehicle: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-[#080808] relative overflow-hidden">
      {/* CHARZO watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[clamp(80px,18vw,200px)] font-black text-white/[0.025] tracking-[-0.05em] leading-none">CHARZO</span>
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5a0] mb-4">Get Charged</p>
            <h2 className="display-md text-white mb-4">
              Need a charge<br />right now?
            </h2>
            <p className="text-white/30 text-base leading-relaxed mb-10 max-w-sm">
              Fill in the form. We'll confirm within minutes and dispatch the nearest van to your location.
            </p>

            {/* Contact info */}
            <div className="space-y-4">
              {[
                { icon: <Mail className="w-4 h-4 text-[#00e5a0]" />, label: 'Email', value: 'info@charzo.in', href: 'mailto:info@charzo.in' },
                { icon: <Phone className="w-4 h-4 text-[#00e5a0]" />, label: 'Phone / WhatsApp', value: '+91 92119 68184', href: 'tel:+919211968184' },
                { icon: <MapPin className="w-4 h-4 text-[#00e5a0]" />, label: 'Address', value: 'B-13A, 1st Floor, Block B, Sector 132, Noida, UP 201304', href: undefined },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-base">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-white/25 text-xs font-medium">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-white text-sm font-semibold hover:text-[#00e5a0] transition-colors">
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-white text-sm font-semibold">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl border border-white/[0.08] p-8" style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full border border-[#00e5a0]/30 bg-[#00e5a0]/10 flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
                    <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00e5a0"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Request Received</h3>
                <p className="text-white/30 text-sm">We'll reach out within minutes. Get ready to charge.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00e5a0]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00e5a0]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">Your EV</label>
                  <select
                    value={form.vehicle}
                    onChange={e => setForm({ ...form, vehicle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00e5a0]/50 transition-colors"
                  >
                    <option value="" className="bg-[#111]">Select vehicle type</option>
                    <option className="bg-[#111]">2 Wheeler EV</option>
                    <option className="bg-[#111]">3 Wheeler EV</option>
                    <option className="bg-[#111]">4 Wheeler EV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">Location / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Your address, parking details, or preferred time..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00e5a0]/50 transition-colors resize-none"
                  />
                </div>
                <GlowButton type="submit" fullWidth height={48} fontSize={14}>
                  <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                    <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="white"/>
                  </svg>
                  Request Charging · Arrives in ~25 min
                </GlowButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
