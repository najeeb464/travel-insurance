import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Printer, 
  Download, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Shield, 
  FileCheck, 
  ArrowLeft 
} from 'lucide-react';
import { policiesApi } from '../../api';
import PolicyCertificate from './PolicyCertificate';

const PublicPolicyModal = ({ isOpen, onClose, policyNumber }) => {
  const [loading, setLoading] = useState(true);
  const [validationData, setValidationData] = useState(null);
  const [fullPolicy, setFullPolicy] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && policyNumber) {
      setLoading(true);
      setError('');
      setValidationData(null);
      setFullPolicy(null);

      const cleanNum = policyNumber.trim().toUpperCase();

      Promise.all([
        policiesApi.validate(cleanNum).catch((err) => ({ error: err })),
        policiesApi.getPolicy(cleanNum).catch((err) => ({ error: err })),
      ])
        .then(([valRes, polRes]) => {
          if (valRes.data && valRes.data.valid) {
            setValidationData(valRes.data);
          } else if (valRes.error) {
            setError(valRes.error.response?.data?.message || 'Policy not found or invalid.');
          }

          if (polRes.data && !polRes.error) {
            setFullPolicy(polRes.data);
          }
        })
        .catch((err) => {
          console.error('Error fetching public policy:', err);
          setError('Unable to verify policy certificate. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, policyNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-auto print:border-none print:shadow-none print:rounded-none print:m-0 print:max-w-full"
        >
          {/* Top Bar (Hidden on print) */}
          <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white font-bold shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  Public Consular & Embassy Verification Portal
                </span>
                <h3 className="text-base sm:text-lg font-bold">
                  Official Travel Insurance Certificate
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6 print:p-0 print:max-h-none print:overflow-visible">
            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#00875A]/20 border-t-[#00875A] rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Verifying policy with Tayara secure database...</p>
                <p className="text-xs text-slate-400 font-mono">Reference: {policyNumber}</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Certificate Verification Unsuccessful</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Home</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Official Verification Banner (Hidden on print) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00875A] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#00875A]">
                          Authentic Policy Verified & Valid
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-[#00875A] font-mono font-bold text-[10px]">
                          Regulation (EC) No 810/2009 Compliant
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        This digital insurance certificate is live, active, and fully recognized by Schengen consulates, embassies, and border control worldwide.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm flex-shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>

                {/* Render Full Official Certificate */}
                {fullPolicy ? (
                  <PolicyCertificate policy={fullPolicy} />
                ) : validationData ? (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-500 uppercase">Policy Number</span>
                        <h4 className="text-lg font-mono font-bold text-[#00875A]">{validationData.policy_number}</h4>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#00875A] font-bold text-xs uppercase">
                        {validationData.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Territory</span>
                        <span className="font-bold text-slate-900">{validationData.territory}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Plan</span>
                        <span className="font-bold text-slate-900">{validationData.plan_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Valid From</span>
                        <span className="font-bold text-slate-900">{validationData.valid_from}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Valid Until</span>
                        <span className="font-bold text-slate-900">{validationData.valid_until}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 block mb-1">Insured Persons:</span>
                      <div className="flex flex-wrap gap-2">
                        {validationData.insured_persons?.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs text-slate-800">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PublicPolicyModal;
