import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, Sparkles } from 'lucide-react';

const StoriesBanner = () => {
  return (
    <section className="py-20 bg-[#003D2B] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#002E21] border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Beyond the policy</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            Stories worth bringing home.
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 font-sans max-w-2xl mx-auto leading-relaxed">
            The best cover fades into the background, leaving you free to take the long road, swim a quieter cove, and follow the view.
          </p>
        </motion.div>

        {/* Feature highlight card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-12 rounded-3xl bg-[#002E21] border border-emerald-700/50 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-8 space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
              <Compass className="w-4 h-4 text-emerald-400" />
              A better way to wander
            </span>

            <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Confidence for every turn.
            </h3>

            <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed font-sans max-w-2xl">
              From mountain roads to coastal escapes, Tayara keeps documents, medical protection, and human support close at hand.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#how"
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-sm shadow-xl shadow-emerald-950/40 transition-all"
            >
              <span>See how cover works</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StoriesBanner;
