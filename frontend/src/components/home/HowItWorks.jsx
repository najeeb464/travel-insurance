import React from 'react';
import { motion } from 'framer-motion';
import { Search, Layers, UserCheck, CreditCard, Sparkles } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Choose your destination',
      desc: "Tell us where and when you're travelling.",
    },
    {
      num: '02',
      icon: Layers,
      title: 'Compare your cover',
      desc: 'Pick the protection that fits your trip.',
    },
    {
      num: '03',
      icon: UserCheck,
      title: 'Add traveller details',
      desc: 'Enter the details shown on each passport.',
    },
    {
      num: '04',
      icon: CreditCard,
      title: 'Receive your policy',
      desc: 'Pay securely and get your certificate.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return (
    <section id="how" className="py-24 bg-emerald-50/50 text-slate-900 relative overflow-hidden border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-[#00875A] text-xs font-bold font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Four simple steps</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 tracking-tight">
            Ready before your bags are packed.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-sans">
            From quote to policy certificate, everything happens online.
          </p>
        </motion.div>

        {/* Connecting step line on desktop */}
        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-emerald-200 z-0 pointer-events-none" />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
          >
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="relative p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-[#00875A] hover:shadow-xl transition-all group space-y-5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875A] border border-emerald-200 flex items-center justify-center p-3 group-hover:bg-[#00875A] group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-3xl font-black font-mono text-emerald-200 group-hover:text-[#00875A]/40 transition-colors">
                      {s.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-slate-900 group-hover:text-[#00875A] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {s.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
