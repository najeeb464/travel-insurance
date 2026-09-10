import React from 'react';
import { CheckCircle2, ShieldCheck, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import PolicyCertificate from './PolicyCertificate';

const PolicySuccessView = ({ onOpenValidateModal }) => {
  const { issuedPolicy, activeOrder, resetBooking } = useBooking();

  if (!issuedPolicy) return null;

  return (
    <section className="py-12 bg-slate-100/70 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success celebration card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Payment Confirmed & Policy Activated
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Your Travel Insurance Policy is Ready!
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Your electronic certificate has been generated and emailed to{' '}
              <strong className="text-slate-900">{activeOrder?.contact_email}</strong>.
            </p>
          </div>

          {/* Action pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenValidateModal(issuedPolicy.policy_number)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify with Public Validation Tool</span>
            </button>

            <button
              onClick={resetBooking}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Purchase Another Policy</span>
            </button>
          </div>
        </div>

        {/* The Digital Policy Certificate */}
        <PolicyCertificate policy={issuedPolicy} />
      </div>
    </section>
  );
};

export default PolicySuccessView;
