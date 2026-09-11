import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api';

const TravelerForm = ({ onOpenPaymentModal }) => {
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
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create order. Please check information.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Main Form */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-8">
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

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 px-8 rounded-2xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing Policy Order...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Secure Instant Checkout (€{pricing.final_total || 0})</span>
                  </>
                )}
              </button>
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
                <p className="text-[10px] text-slate-400">Includes all taxes, embassy stamps, and digital delivery fees.</p>
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
