import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { GlowButton } from './GlowButton';

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzYBKI4MYnFA3JW33757ku-jLoGna4zkBvFYcDA0Fc2oZcLWpN3Xx6KIMT_-w9EUbjEjg/exec';

interface FormState {
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  vehicle?: string;
  message?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  // Name: required, at least 2 chars, only letters and spaces
  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (!/^[a-zA-Z\s'-]+$/.test(form.name.trim())) {
    errors.name = 'Name can only contain letters.';
  }

  // Email: required, valid format
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  // Phone: required, exactly 10 digits (Indian mobile)
  const digits = form.phone.replace(/\D/g, '');
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (digits.length < 10) {
    errors.phone = 'Phone number must be at least 10 digits.';
  } else if (digits.length > 13) {
    errors.phone = 'Phone number is too long.';
  } else if (digits.length === 10 && !/^[6-9]/.test(digits)) {
    errors.phone = 'Enter a valid Indian mobile number.';
  }

  // Vehicle: required
  if (!form.vehicle) {
    errors.vehicle = 'Please select your vehicle type.';
  }

  // Location: required, min 10 chars so it's actually useful
  if (!form.message.trim()) {
    errors.message = 'Please share your location or address.';
  } else if (form.message.trim().length < 10) {
    errors.message = 'Please provide a more detailed address (min 10 characters).';
  }

  return errors;
}

export const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', vehicle: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate a single field on blur
  const handleBlur = (field: keyof FormState) => {
    setTouched(t => ({ ...t, [field]: true }));
    const errs = validate(form);
    setErrors(errs);
  };

  // Update field and clear its error if now valid
  const handleChange = (field: keyof FormState, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      const errs = validate(updated);
      setErrors(errs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched and run full validation
    setTouched({ name: true, email: true, phone: true, vehicle: true, message: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setSubmitError(null);

    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          vehicle: form.vehicle,
          location: form.message.trim(),
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError('Something went wrong. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: field wrapper with inline error
  const field = (
    label: string,
    key: keyof FormState,
    input: React.ReactNode
  ) => (
    <div>
      <label className="block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">{label}</label>
      {input}
      {touched[key] && errors[key] && (
        <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="#f87171"/>
            <path d="M6 3.5v3M6 8h.01" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {errors[key]}
        </p>
      )}
    </div>
  );

  const inputCls = (key: keyof FormState) =>
    `w-full h-11 px-4 rounded-xl bg-white/[0.04] border text-white text-sm placeholder-white/20 focus:outline-none transition-colors ${
      touched[key] && errors[key]
        ? 'border-red-500/50 focus:border-red-500/70'
        : 'border-white/[0.08] focus:border-[#00e5a0]/50'
    }`;

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
                  <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-white/25 text-xs font-medium">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-white text-sm font-semibold hover:text-[#00e5a0] transition-colors">{c.value}</a>
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
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {submitError}
                  </div>
                )}

                {field('Your Name', 'name',
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={inputCls('name')}
                  />
                )}

                {field('Email', 'email',
                  <input
                    type="email"
                    placeholder="e.g. rahul@gmail.com"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={inputCls('email')}
                  />
                )}

                {field('Phone / WhatsApp', 'phone',
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={13}
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value.replace(/[^\d+\s-]/g, ''))}
                    onBlur={() => handleBlur('phone')}
                    className={inputCls('phone')}
                  />
                )}

                {field('Your EV', 'vehicle',
                  <select
                    value={form.vehicle}
                    onChange={e => handleChange('vehicle', e.target.value)}
                    onBlur={() => handleBlur('vehicle')}
                    className={`${inputCls('vehicle')} ${!form.vehicle ? 'text-white/20' : ''}`}
                  >
                    <option value="" className="bg-[#111] text-white/40">Select vehicle type</option>
                    <option value="2 Wheeler EV" className="bg-[#111] text-white">2 Wheeler EV</option>
                    <option value="3 Wheeler EV" className="bg-[#111] text-white">3 Wheeler EV</option>
                    <option value="4 Wheeler EV" className="bg-[#111] text-white">4 Wheeler EV</option>
                  </select>
                )}

                {field('Location / Notes', 'message',
                  <textarea
                    rows={3}
                    placeholder="e.g. Sector 62, Noida — near City Centre mall, Gate 2"
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder-white/20 focus:outline-none transition-colors resize-none ${
                      touched.message && errors.message
                        ? 'border-red-500/50 focus:border-red-500/70'
                        : 'border-white/[0.08] focus:border-[#00e5a0]/50'
                    }`}
                  />
                )}

                <GlowButton type="submit" fullWidth height={48} fontSize={14} disabled={loading}>
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                        <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="white"/>
                      </svg>
                      Request Charging · Arrives in ~25 min
                    </>
                  )}
                </GlowButton>

                <p className="text-white/15 text-[10px] text-center">
                  By submitting, you agree to be contacted by CHARZO regarding your charging request.
                </p>

              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
