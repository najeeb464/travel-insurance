import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Users, 
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { promotionsApi, quotesApi } from '../../api';

const PlanComparisonCards = () => {
  const {
    calculatedQuotes,
    selectedPlanOption,
    setSelectedPlanOption,
    setCurrentStep,
    selectedDestination,
    startDate,
    endDate,
    travelersAges,
    appliedPromo,
    setAppliedPromo,
    setCalculatedQuotes,
    setActiveQuote,
    calculateDays,
  } = useBooking();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState(null);

  const durationDays = calculateDays();

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setPromoLoading(true);
    setPromoMessage(null);

    try {
      const res = await promotionsApi.validate(promoCodeInput.trim(), 50.00);
      if (res.data.valid) {
        setAppliedPromo(res.data);
        setPromoMessage({ type: 'success', text: `Promo '${res.data.code}' applied! ${res.data.discount_value}% discount.` });

        // Recalculate quotes with promo code
        const recalc = await quotesApi.calculate({
          destination_id: selectedDestination.id,
          start_date: startDate,
          end_date: endDate,
          travelers_ages: travelersAges,
          promo_code: res.data.code,
        });
        if (recalc.data.plan_options) {
          setCalculatedQuotes(recalc.data.plan_options);
        }
      }
    } catch (err) {
      setPromoMessage({
        type: 'error',
        text: err.response?.data?.message || 'Invalid promo code',
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSelectPlan = (planOption) => {
    setSelectedPlanOption(planOption);
    // Fetch full quote details or set active quote
    quotesApi.getQuote(planOption.quote_number)
      .then((res) => {
        setActiveQuote(res.data);
        setCurrentStep(3); // Move to Traveler details step
        window.scrollTo({ top: 100, behavior: 'smooth' });
      })
      .catch((err) => {
        console.error('Error fetching quote details:', err);
        setCurrentStep(3);
      });
  };

  if (!calculatedQuotes || calculatedQuotes.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider mb-2">
            Step 2 of 4: Select Tariff Plan
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Choose Your Travel Insurance Tariff
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            All plans meet 100% of Schengen visa criteria, cover COVID-19 hospitalization, and include emergency assistance.
          </p>

          {/* Quick summary chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              {selectedDestination?.name}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              {startDate} to {endDate} ({durationDays} days)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              {travelersAges.length} {travelersAges.length === 1 ? 'Traveler' : 'Travelers'}
            </span>
          </div>
        </div>

        {/* Promo Code Bar */}
        <div className="max-w-md mx-auto mb-10">
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Have a promo code? (e.g. EKTA10)"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                className="w-full p-3 pl-10 rounded-xl bg-white border border-slate-200 text-xs font-bold tracking-wider uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={promoLoading}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {promoLoading ? 'Applying...' : 'Apply Code'}
            </button>
          </form>

          {promoMessage && (
            <div className={`mt-2 text-xs flex items-center gap-1.5 ${promoMessage.type === 'success' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-medium'}`}>
              {promoMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{promoMessage.text}</span>
            </div>
          )}
        </div>

        {/* The 3 Tariff Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {calculatedQuotes.map((plan) => {
            const isGold = plan.plan_code === 'GOLD' || plan.is_popular;
            const pricing = plan.pricing || {};
            const total = pricing.final_total || 0;
            const subtotal = pricing.subtotal || total;
            const discount = pricing.total_discount || 0;
            const currency = pricing.currency || 'EUR';

            return (
              <div
                key={plan.plan_id}
                className={`relative rounded-3xl transition-all duration-200 flex flex-col justify-between ${
                  isGold 
                    ? 'bg-white border-2 border-brand-600 shadow-2xl shadow-brand-500/15 ring-4 ring-brand-500/10 scale-[1.02]' 
                    : 'bg-white border border-slate-200 shadow-lg hover:border-slate-300'
                }`}
              >
                {/* Popular Badge */}
                {isGold && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-600 to-blue-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Most Popular Tariff</span>
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Plan Name & Coverage Limit */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tariff Plan</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">{plan.plan_name}</h3>
                    
                    <div className="mt-4 p-3 rounded-2xl bg-brand-50/70 border border-brand-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-900">Medical Coverage Limit</span>
                      <span className="text-base font-black text-brand-700">{plan.medical_limit_display}</span>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="pt-2 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">€{total}</span>
                      <span className="text-xs font-semibold text-slate-500">total for {durationDays} days</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-400 line-through">€{subtotal}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Saved €{discount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-3 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Included Protection:</span>
                    
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">Emergency medical treatment in accredited clinics</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">Emergency medical evacuation & repatriation</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">COVID-19 outpatient & inpatient care</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">Zero deductible (€0 client excess)</span>
                    </div>

                    {/* Gold & Max+ extra benefits */}
                    {plan.plan_code !== 'START' && (
                      <>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium">Lost & damaged airline baggage protection</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium">Emergency dental pain treatment</span>
                        </div>
                      </>
                    )}

                    {/* Max+ exclusive */}
                    {plan.plan_code === 'MAX_PLUS' && (
                      <>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium">Active sports & recreation included</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium">Civil legal liability & attorney assistance</span>
                        </div>
                      </>
                    )}

                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">24/7 Multi-language WhatsApp & Hotline</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="p-6 sm:p-8 pt-0">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                      isGold
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Select {plan.plan_name}</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlanComparisonCards;
