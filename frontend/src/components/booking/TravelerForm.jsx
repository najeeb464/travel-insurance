import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  ArrowLeft, 
  AlertCircle,
  Calendar,
  CheckCircle2,
  Globe,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Lock,
  FileCheck,
  Zap
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api';

const TravelerForm = ({ onOpenPaymentModal }) => {
  const formRef = useRef(null);
  const { 
    selectedPlanOption, 
    setCurrentStep, 
    travelersAges,
    selectedDestination,
    startDate,
    endDate,
    setActiveOrder,
    calculateDays,
  } = useBooking();

  const { user } = useAuth();

  // Primary contact buyer state
  const [contactFullName, setContactFullName] = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone_number || '+92 300 1234567');

  // Travelers state
  const [travelers, setTravelers] = useState(() => {
    return travelersAges.map((age, idx) => {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - age;
      return {
        first_name: idx === 0 && user?.first_name ? user.first_name : '',
        last_name: idx === 0 && user?.last_name ? user.last_name : '',
        date_of_birth: `${birthYear}-05-15`,
        gender: 'MALE',
        nationality: 'Pakistan',
        passport_number: '',
        passport_expiry: '2032-12-31',
        email: idx === 0 && user?.email ? user.email : '',
        phone: idx === 0 && user?.phone_number ? user.phone_number : '',
        is_primary: idx === 0,
      };
    });
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const durationDays = calculateDays();
  const pricing = selectedPlanOption?.pricing || {};

  const handleTravelerFieldChange = (index, field, value) => {
    const updated = [...travelers];
    updated[index][field] = value;
    setTravelers(updated);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPlanOption?.quote_number) {
      setError('Please select a valid insurance plan quote before proceeding.');
      return;
    }

    if (!contactFullName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setError('Please provide complete buyer contact information.');
      return;
    }

    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i];
      if (!t.first_name.trim() || !t.last_name.trim() || !t.passport_number.trim()) {
        setError(`Please fill all names and passport numbers for Traveler #${i + 1}.`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        quote_number: selectedPlanOption.quote_number,
        contact_full_name: contactFullName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        travelers: travelers,
      };

      const res = await ordersApi.create(payload);
      setActiveOrder(res.data);
      onOpenPaymentModal(res.data);
    } catch (err) {
      console.error('Order creation error:', err);
      const data = err.response?.data;
      let errorMsg = 'Failed to create order. Please verify your information.';
      if (typeof data === 'string') {
        errorMsg = data;
      } else if (data?.detail) {
        errorMsg = data.detail;
      } else if (data?.error) {
        errorMsg = data.error;
      } else if (data?.quote_number) {
        errorMsg = Array.isArray(data.quote_number) ? data.quote_number.join(' ') : data.quote_number;
      } else if (data?.travelers) {
        errorMsg = typeof data.travelers === 'string' ? data.travelers : 'Please verify all traveler details.';
      } else if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        errorMsg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val);
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlanOption) {
    return (
      <section className="py-20 bg-slate-50 text-slate-900 border-t border-slate-200">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            No Plan Selected
          </h3>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Please choose an insurance coverage tariff before entering traveler and passport information.
          </p>
          <button
            onClick={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 100, behavior: 'smooth' });
            }}
            className="px-6 py-3.5 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tariff Options</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-slate-50 text-slate-900 relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00875A] hover:text-[#00734c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tariff Options</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-mono font-bold uppercase tracking-wider text-[#00875A]">
            <Sparkles className="w-3.5 h-3.5 text-[#00875A]" />
            Step 3 of 4: Passport & Traveler Details
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form ref={formRef} onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-8">
            {/* Buyer Contact Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 space-y-6 shadow-md">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#00875A] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Lead Policy Contact</h3>
                  <p className="text-xs text-slate-500">The digital policy certificate and PDF receipt will be sent directly here.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Buyer Full Name (as on card/passport) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JOHN DOE"
                    value={contactFullName}
                    onChange={(e) => setContactFullName(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phone Number (WhatsApp Support) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+92 300 1234567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Travelers Passport Forms */}
            {travelers.map((t, idx) => (
              <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 space-y-6 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00875A] border border-emerald-200 flex items-center justify-center font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Traveler #{idx + 1} Passport Information
                      </h4>
                      <p className="text-xs text-slate-500">Must match machine-readable zone of passport.</p>
                    </div>
                  </div>
                  {t.is_primary && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-[#00875A]">
                      Primary Insured
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      First Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JOHN"
                      value={t.first_name}
                      onChange={(e) => handleTravelerFieldChange(idx, 'first_name', e.target.value.toUpperCase())}
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Last Name / Surname *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DOE"
                      value={t.last_name}
                      onChange={(e) => handleTravelerFieldChange(idx, 'last_name', e.target.value.toUpperCase())}
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Passport Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AB1234567"
                      value={t.passport_number}
                      onChange={(e) => handleTravelerFieldChange(idx, 'passport_number', e.target.value.toUpperCase())}
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={t.date_of_birth}
                      onChange={(e) => handleTravelerFieldChange(idx, 'date_of_birth', e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Citizenship / Country
                    </label>
                    <input
                      type="text"
                      required
                      value={t.nationality}
                      onChange={(e) => handleTravelerFieldChange(idx, 'nationality', e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={t.gender}
                      onChange={(e) => handleTravelerFieldChange(idx, 'gender', e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Submit Action Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="text-center sm:text-left">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Amount Due</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">€{pricing.final_total || 0}</span>
                    <span className="text-xs text-slate-500 font-mono">({pricing.currency || 'EUR'})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Policy PDF Issuance</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 px-8 rounded-2xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all disabled:opacity-50 group cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Policy Order...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>Proceed to Secure Instant Checkout (€{pricing.final_total || 0})</span>
                  </>
                )}
              </button>

              {/* Trust Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <Lock className="w-4 h-4 text-[#00875A] flex-shrink-0" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800">256-Bit SSL</p>
                    <p className="text-slate-500">Bank-grade security</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <FileCheck className="w-4 h-4 text-[#00875A] flex-shrink-0" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800">Official Tayara PDF</p>
                    <p className="text-slate-500">With QR verification</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <ShieldCheck className="w-4 h-4 text-[#00875A] flex-shrink-0" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800">100% Visa Approved</p>
                    <p className="text-slate-500">Money-back guarantee</p>
                  </div>
                </div>
              </div>

              {/* Legal & Payment Methods */}
              <div className="pt-2 text-center text-xs text-slate-500 space-y-2 border-t border-slate-100">
                <p>
                  By proceeding, you agree to Tayara's Insurance Policy Conditions and certify that all passenger passport information is accurate.
                </p>
                <div className="flex items-center justify-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>VISA</span>
                  <span>•</span>
                  <span>Mastercard</span>
                  <span>•</span>
                  <span>Stripe</span>
                  <span>•</span>
                  <span>Apple Pay</span>
                </div>
              </div>
            </div>
          </form>

          {/* Right Summary Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5 sticky top-28 text-slate-900">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00875A]">Policy Summary</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#00875A] text-[10px] font-bold uppercase">
                  {selectedPlanOption?.plan_name}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Destination</span>
                  <span className="font-bold text-slate-900">{selectedDestination?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-mono font-bold text-slate-900">{durationDays} Days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Insured Travelers</span>
                  <span className="font-mono font-bold text-slate-900">{travelers.length} Person(s)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Medical Cover Limit</span>
                  <span className="font-bold text-[#00875A]">{selectedPlanOption?.medical_limit_display}</span>
                </div>
                {selectedPlanOption?.coverages && selectedPlanOption.coverages.length > 0 && (
                  <div className="py-1 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500">Included Benefits</span>
                      <span className="text-[10px] text-[#00875A] font-bold">
                        {selectedPlanOption.coverages.length} Categories
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlanOption.coverages.slice(0, 3).map((c) => (
                        <span key={c.id || c.coverage_code} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {c.coverage_name}
                        </span>
                      ))}
                      {selectedPlanOption.coverages.length > 3 && (
                        <span className="text-[10px] text-emerald-700 font-bold px-1 py-0.5">
                          +{selectedPlanOption.coverages.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Deductible / Excess</span>
                  <span className="font-mono font-bold text-[#00875A]">€0 (Zero Deductible)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-slate-500 uppercase font-bold">Total Amount Due</span>
                  <span className="text-3xl font-bold text-[#00875A]">€{pricing.final_total || 0}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-4">Includes all taxes, embassy stamps, and digital delivery fees.</p>

                <button
                  type="button"
                  onClick={() => formRef.current?.requestSubmit()}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Processing...' : `Proceed to Checkout (€${pricing.final_total || 0})`}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-[#00875A] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Embassy Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Meets European Parliament Regulation (EC) No 810/2009. Eligible for Schengen visa application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelerForm;
