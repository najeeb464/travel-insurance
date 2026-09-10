import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, Headphones, HeartPulse, FileCheck } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Embassy & Consulate Accepted',
      desc: 'Formulated in exact accordance with EU Regulation No 810/2009. Guaranteed acceptance by all 29 European Schengen member consulates worldwide.',
      badge: 'Visa Guarantee',
    },
    {
      icon: Clock,
      title: 'Issued Electronically in 2 Minutes',
      desc: 'No waiting, no paper forms. Pay online securely and instantly receive your official policy PDF certificate directly into your inbox.',
      badge: 'Instant Delivery',
    },
    {
      icon: CheckCircle2,
      title: 'Zero Deductible (€0 Client Excess)',
      desc: 'No unexpected out-of-pocket costs. In case of emergency, medical expenses and hospitalization are covered 100% from the first euro.',
      badge: 'No Deductibles',
    },
    {
      icon: Headphones,
      title: '24/7 International Medical Assistance',
      desc: 'Dedicated round-the-clock coordinator hotline and multilingual WhatsApp assistance across all global timezones in case of emergency.',
      badge: 'Always Available',
    },
    {
      icon: HeartPulse,
      title: 'COVID-19 Hospitalization Included',
      desc: 'Diagnostic testing, acute medical isolation, and hospital treatment are fully covered across all our tariffs without extra charge.',
      badge: 'Pandemic Cover',
    },
    {
      icon: FileCheck,
      title: 'Instant Online Verification',
      desc: 'Every policy comes with a unique digital certificate number and QR code for real-time verification by border control officers and visa officers.',
      badge: 'Public Validation',
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            The EKTA Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Over 150,000 Tourists Trust EKTA
          </h2>
          <p className="text-sm text-slate-600">
            Engineered to remove all hassle from travel insurance. Simple, transparent, and legally binding worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 transition-all group space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white text-slate-600 border border-slate-200">
                    {f.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
