import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Calendar, 
  MapPin, 
  Users, 
  FileCheck 
} from 'lucide-react';
import { policiesApi } from '../../api';

const ValidateInsuranceModal = ({ isOpen, onClose, initialPolicyNumber = '' }) => {
  const [policyNumber, setPolicyNumber] = useState(initialPolicyNumber);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-brand-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Validate Insurance Certificate</h3>
              <p className="text-xs text-slate-300">Public policy authenticity check for visas & border control</p>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Enter Policy Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. EKTA-2026-ABC1234"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value.toUpperCase())}
                  className="w-full p-3.5 pl-10 rounded-xl border border-slate-200 text-sm font-mono font-bold uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs transition-all disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Verify Now'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              You can find this number at the top right of your electronic insurance certificate.
            </p>
          </form>

          {/* Error display */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Validation Result Card */}
          {result && (
            <div className={`p-6 rounded-2xl border space-y-4 ${
              result.valid 
                ? 'bg-emerald-50/50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-black text-slate-900">
                    {result.message}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  {result.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Policy Number</span>
                  <span className="font-mono font-bold text-slate-900">{result.policy_number}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Tariff Plan</span>
                  <span className="font-bold text-brand-700">{result.plan_name}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Territory</span>
                  <span className="font-bold text-slate-900">{result.territory}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Valid Period</span>
                  <span className="font-bold text-slate-900">{result.valid_from} to {result.valid_until}</span>
                </div>
              </div>

              {result.insured_persons && result.insured_persons.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/60">
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Insured Persons ({result.travelers_count}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.insured_persons.map((name, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs font-semibold text-slate-800">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-500 pt-1">
                * Strict privacy protection: Passport numbers are masked in accordance with international data security standards.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidateInsuranceModal;
