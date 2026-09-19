import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Calendar, 
  MapPin, 
  FileCheck 
} from 'lucide-react';
import { policiesApi } from '../../api';

const ValidateInsuranceModal = ({ isOpen, onClose, initialPolicyNumber = '', onOpenPublicVerify }) => {
  const [policyNumber, setPolicyNumber] = useState(initialPolicyNumber);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!policyNumber.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await policiesApi.validate(policyNumber.trim());
      setResult(res.data);
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.response?.data?.message || 'No insurance policy found matching this number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white shadow-md">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Validate Insurance Certificate</h3>
                  <p className="text-xs text-slate-400 font-sans">Public policy verification for embassies & border control</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <form onSubmit={handleValidate} className="space-y-3">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Enter Policy Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. TAYARA-2026-ABC1234"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value.toUpperCase())}
                      className="w-full p-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold uppercase tracking-wider text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3.5 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-xs transition-all disabled:opacity-50 shadow-md shadow-emerald-700/20"
                  >
                    {loading ? 'Validating...' : 'Verify'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {result && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                    <div className="flex items-center gap-2 text-[#00875A] font-bold text-xs uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{result.status || 'Active Valid Policy'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">{result.policy_number}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Plan Name</span>
                      <span className="font-bold">{result.plan_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Insured Destination</span>
                      <span className="font-bold">{result.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Validity Period</span>
                      <span className="font-mono font-bold">{result.start_date} to {result.end_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Embassy Status</span>
                      <span className="font-bold text-[#00875A]">{result.embassy_status || 'Compliant (EC 810/2009)'}</span>
                    </div>
                  </div>

                  {onOpenPublicVerify && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPublicVerify(result.policy_number);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>View Full Official Document & Certificate</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ValidateInsuranceModal;
