import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  FileText, 
  Lock, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle,
  Calendar,
  CheckCircle2,
  Globe
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
      // Calculate approximate birth year from age
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

    // Validation
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
      // Open Payment Modal
      onOpenPaymentModal(res.data);
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create order. Please check information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tariffs</span>
          </button>

          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Step 3 of 4: Traveler Information
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (Left 2 cols) */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-8">
            {/* Buyer Contact Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Lead Contact / Policy Buyer</h3>
                  <p className="text-xs text-slate-500">The digital insurance certificate and payment receipt will be sent here.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Buyer Full Name (as on card/passport) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={contactFullName}
                    onChange={(e) => setContactFullName(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address (Policy Delivery) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-3.5 pl-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Mobile Phone (Emergency SMS) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-3.5 pl-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Travelers Passport Information Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">
                  Insured Travelers ({travelers.length})
                </h3>
                <span className="text-xs text-slate-500">
                  * Must match international passport exactly for visa approval
                </span>
              </div>

              {travelers.map((t, idx) => (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {t.is_primary ? 'Primary Tourist (Applicant)' : `Traveler #${idx + 1}`}
                        </h4>
                        <p className="text-xs text-slate-500">Age: {travelersAges[idx] || 30} years old</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      Insured for {selectedPlanOption?.medical_limit_display}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        First Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John"
                        value={t.first_name}
                        onChange={(e) => handleTravelerFieldChange(idx, 'first_name', e.target.value.toUpperCase())}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Last Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Doe"
                        value={t.last_name}
                        onChange={(e) => handleTravelerFieldChange(idx, 'last_name', e.target.value.toUpperCase())}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* DOB */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={t.date_of_birth}
                        onChange={(e) => handleTravelerFieldChange(idx, 'date_of_birth', e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={t.gender}
                        onChange={(e) => handleTravelerFieldChange(idx, 'gender', e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Passport Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        International Passport Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AB1234567"
                        value={t.passport_number}
                        onChange={(e) => handleTravelerFieldChange(idx, 'passport_number', e.target.value.toUpperCase())}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-black uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Passport Expiry Date */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Passport Expiry Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={t.passport_expiry}
                        min={endDate}
                        onChange={(e) => handleTravelerFieldChange(idx, 'passport_expiry', e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Nationality */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Country of Citizenship / Nationality
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pakistan, Germany, France, United Kingdom"
                        value={t.nationality}
                        onChange={(e) => handleTravelerFieldChange(idx, 'nationality', e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button on Mobile */}
            <div className="lg:hidden">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 disabled:opacity-50"
              >
                {loading ? 'Submitting Order...' : 'Proceed to Payment →'}
              </button>
            </div>
          </form>

          {/* Right Column: Sticky Order Summary */}
          <div className="space-y-6">
            <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <h3 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h3>

              {/* Snapshot details */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Destination</span>
                  <span className="font-bold text-slate-900">{selectedDestination?.name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dates</span>
                  <span className="font-bold text-slate-900">{startDate} to {endDate}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-bold text-slate-900">{durationDays} days</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tariff Plan</span>
                  <span className="font-bold text-brand-600">{selectedPlanOption?.plan_name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Medical Limit</span>
                  <span className="font-bold text-emerald-600">{selectedPlanOption?.medical_limit_display}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Insured Tourists</span>
                  <span className="font-bold text-slate-900">{travelers.length}</span>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold">€{pricing.subtotal || pricing.final_total}</span>
                </div>

                {pricing.total_discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>Discount Applied</span>
                    <span>-€{pricing.total_discount}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-3 border-t border-slate-200">
                  <span className="text-base font-black text-slate-900">Total to Pay</span>
                  <span className="text-3xl font-black text-slate-900">€{pricing.final_total}</span>
                </div>
                <p className="text-[11px] text-slate-400 text-right">Includes all taxes and Schengen certification</p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="pt-2 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>100% Embassy & Consulate Money-Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>256-Bit Encrypted PCI-DSS Compliant Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelerForm;
