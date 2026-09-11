import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Headphones, HeartPulse, FileCheck, Globe, Sparkles } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Globe,
      title: 'Accepted worldwide',
      desc: 'Travel documents designed to meet visa and border requirements across 190+ destinations.',
      badge: 'Global Acceptance',
    },
    {
      icon: Clock,
      title: 'Covered in 2 minutes',
      desc: 'Choose your cover, pay securely, and receive your policy certificate straight to your inbox.',
      badge: 'Instant Delivery',
    },
    {
      icon: CheckCircle2,
      title: 'Zero hidden deductibles',
      desc: 'Know exactly what you pay and what is protected before you start your journey.',
      badge: '€0 Excess',
    },
    {
      icon: Headphones,
      title: '24/7 human assistance',
      desc: 'Multilingual travel coordinators are ready whenever plans change or an emergency happens.',
      badge: 'Always Ready',
    },
    {
      icon: HeartPulse,
      title: 'Up to €100k medical cover',
      desc: 'Emergency treatment, hospital stays, and medical transport can be included in your plan.',
      badge: 'Full Hospital Cover',
    },
    {
      icon: FileCheck,
      title: 'Digital policy certificate',
      desc: 'Every policy has a unique reference for quick, secure authenticity checks.',
      badge: 'QR Verified',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <section id="coverage" className="py-24 bg-slate-50 text-slate-900 relative overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-[#00875A] text-xs font-bold font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Protection without the fine print</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 tracking-tight">
            Confidence for every kind of journey.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            Straightforward benefits designed for real travel, from missed flights to medical emergencies.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-[#00875A]/40 transition-all group space-y-5 cursor-default"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00875A] flex items-center justify-center p-3 group-hover:bg-[#00875A] group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-[#00875A] border border-emerald-200">
                    {f.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-heading text-slate-900 group-hover:text-[#00875A] transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-sans">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
