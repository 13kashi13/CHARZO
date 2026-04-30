import React from 'react';
import { MapPin, Zap, Clock, Car } from 'lucide-react';

const reasons = [
  {
    icon: <MapPin className="w-6 h-6 text-teal-600" />,
    title: 'We Come to You',
    description: 'No more hunting for charging stations. Book a charge and our van arrives at your doorstep — home, office, or anywhere.',
    color: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    icon: <Car className="w-6 h-6 text-emerald-600" />,
    title: 'All EVs Welcome',
    description: 'From electric scooters and bikes to sedans and SUVs — CHARZO supports all EV types with the right connectors.',
    color: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: <Clock className="w-6 h-6 text-teal-600" />,
    title: 'Live ETA + 24×7 Support',
    description: 'Track your charging van in real time. Our support team is available around the clock, every day of the year.',
    color: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    icon: <Zap className="w-6 h-6 text-emerald-600" />,
    title: 'Fast Charging On the Go',
    description: 'Powered by high-capacity mobile units, we deliver fast charging speeds so you\'re back on the road quickly.',
    color: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

export const WhyCharzo: React.FC = () => {
  return (
    <section id="why" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 mb-3">Why Choose Us</p>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
            Charging, <span className="gradient-text">reimagined.</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            CHARZO is built for the modern EV owner who values time, convenience, and reliability.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <div
              key={i}
              className={`card-hover rounded-2xl border ${r.border} ${r.color} p-6`}
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5 border border-white">
                {r.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{r.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
