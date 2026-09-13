import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import PolicyCertificate from './PolicyCertificate';

const PolicySuccessView = ({ onOpenValidateModal }) => {
  const { issuedPolicy, activeOrder, resetBooking } = useBooking();

  if (!issuedPolicy) return null;

  return (
    <section className="py-12 bg-slate-50 text-slate-900 min-h-screen relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Success celebration card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-5 relative overflow-hidden print:hidden"
        >
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-20 h-20 rounded-3xl bg-[#00875A] text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-700/20"
          >
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </motion.div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#00875A] text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Payment Confirmed • Policy Activated Live
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Your Travel Insurance Policy is Official!
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto font-sans">
              Your embassy-compliant certificate has been issued and emailed to{' '}
              <strong className="text-[#00875A] font-mono">{activeOrder?.contact_email}</strong>.
            </p>
          </div>

          {/* Action pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenValidateModal(issuedPolicy.policy_number)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-[#00875A] hover:bg-[#00734c] shadow-md shadow-emerald-700/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Verify with Official Validation Tool</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={resetBooking}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Purchase Another Policy</span>
            </motion.button>
          </div>
        </motion.div>

        {/* The Digital Policy Certificate */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <PolicyCertificate policy={issuedPolicy} />
        </motion.div>
      </div>
    </section>
  );
};

export default PolicySuccessView;
