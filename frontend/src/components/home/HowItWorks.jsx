import React from 'react';
import { Search, Layers, UserCheck, CreditCard, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Select Destination & Dates',
      desc: 'Pick where you are traveling—Schengen Zone, Europe, or Worldwide—and choose trip dates and tourist ages.',
    },
    {
      num: '02',
      icon: Layers,
      title: 'Compare & Choose Tariff',
      desc: 'Pick the coverage that fits your journey: Start (€30k), Gold (€50k, Most Popular), or Max+ (€100k VIP).',
    },
    {
      num: '03',
      icon: UserCheck,
      title: 'Enter Passport Information',
      desc: 'Fill in tourists names and passport details exactly as they appear on international passports.',
    },
    {
      num: '04',
      icon: CreditCard,
      title: 'Pay & Receive Policy PDF',
      desc: 'Pay securely via Visa, Mastercard, or Apple Pay. Your official policy certificate is generated in seconds.',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            How It Works
          </h2>
          <p className="text-sm text-slate-400">
            From quote to official embassy-ready policy certificate in under two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-3xl bg-slate-800/60 border border-slate-700/80 hover:border-brand-500/50 transition-all group space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-700 group-hover:text-brand-400/40 transition-colors">
                    {s.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
