import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Users, 
  MapPin,
  ChevronRight,
  Crown
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { promotionsApi, quotesApi } from '../../api';

const PlanComparisonCards = () => {
  const {
    calculatedQuotes,
    setSelectedPlanOption,
    setCurrentStep,
    selectedDestination,
    startDate,
    endDate,
    travelersAges,
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
    quotesApi.getQuote(planOption.quote_number)
      .then((res) => {
        setActiveQuote(res.data);
        setCurrentStep(3);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <section className="py-16 bg-slate-50 text-slate-900 relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Step Indicator Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-[#00875A] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#00875A]" />
            <span>Step 2 of 4: Select Insurance Tariff</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-slate-900">
            Choose Your Travel Cover Plan
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-sans">
            100% Schengen & embassy compliant • Instant digital certificate • 24/7 assistance
          </p>

          {/* Quick summary chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#00875A]" />
              {selectedDestination?.name}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              {startDate} to {endDate} ({durationDays} days)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Users className="w-3.5 h-3.5 text-[#00875A]" />
              {travelersAges.length} {travelersAges.length === 1 ? 'Traveler' : 'Travelers'}
            </span>
          </div>
        </motion.div>

        {/* Promo Code Bar */}
        <div className="max-w-md mx-auto mb-12">
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="PROMO CODE (e.g. AEROSURE10)"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                className="w-full p-3.5 pl-10 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold tracking-wider uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={promoLoading}
              className="px-5 py-3.5 bg-[#00875A] hover:bg-[#00734c] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-emerald-700/20"
            >
              {promoLoading ? 'Validating...' : 'Apply Code'}
            </motion.button>
          </form>

          <AnimatePresence>
            {promoMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-2 text-xs flex items-center justify-center gap-1.5 p-2 rounded-lg ${
                  promoMessage.type === 'success' 
                    ? 'text-[#00875A] bg-emerald-50 border border-emerald-200' 
                    : 'text-rose-600 bg-rose-50 border border-rose-200'
                }`}
              >
                {promoMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#00875A]" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                <span>{promoMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3 Tariff Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {calculatedQuotes.map((plan) => {
            const isGold = plan.plan_code === 'GOLD' || plan.is_popular;
            const isMaxPlus = plan.plan_code === 'MAX_PLUS';
            const pricing = plan.pricing || {};
            const total = pricing.final_total || 0;
            const subtotal = pricing.subtotal || total;
            const discount = pricing.total_discount || 0;

            let cardBg = 'bg-white border-slate-200 shadow-md hover:border-emerald-300';
            let btnStyle = 'bg-[#00875A] hover:bg-[#00734c] text-white shadow-md shadow-emerald-700/20';
            let limitBadge = 'bg-emerald-50 border-emerald-200 text-[#00875A]';
            let checkIconColor = 'text-[#00875A]';

            if (isGold) {
              cardBg = 'bg-white border-2 border-[#00875A] shadow-xl ring-2 ring-[#00875A]/20 scale-[1.02]';
              btnStyle = 'bg-[#00875A] hover:bg-[#00734c] text-white font-bold shadow-lg shadow-emerald-700/25';
              limitBadge = 'bg-emerald-100/80 border-emerald-300 text-[#00875A]';
              checkIconColor = 'text-[#00875A]';
            }

            return (
              <motion.div
                key={plan.plan_id}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border ${cardBg}`}
              >
                {/* Popular Badge */}
                {isGold && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00875A] text-white text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-white" />
                    <span>Most Popular</span>
                  </div>
                )}
                {isMaxPlus && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>VIP Cover</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Tariff Level</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">{plan.plan_name}</h3>
                    
                    <div className={`mt-4 p-3.5 rounded-2xl border flex items-center justify-between ${limitBadge}`}>
                      <span className="text-xs font-semibold text-slate-600">Medical Cover Limit</span>
                      <span className="text-base font-bold tracking-tight">{plan.medical_limit_display}</span>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="pt-2 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-serif font-bold text-slate-900">€{total}</span>
                      <span className="text-xs font-medium text-slate-500">total for {durationDays} days</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400 line-through font-mono">€{subtotal}</span>
                        <span className="text-xs font-bold text-[#00875A] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Saved €{discount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-3 text-xs">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Included Coverage:</span>
                    
                    <div className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${checkIconColor}`} />
                      <span className="text-slate-700 font-medium">Emergency medical treatment in top clinics</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${checkIconColor}`} />
                      <span className="text-slate-700 font-medium">Medical evacuation & repatriation included</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${checkIconColor}`} />
                      <span className="text-slate-700 font-medium">COVID-19 outpatient & inpatient care</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${checkIconColor}`} />
                      <span className="text-slate-700 font-medium">Zero deductible (€0 client excess)</span>
                    </div>

                    {plan.plan_code !== 'START' && (
                      <>
                        <div className="flex items-start gap-2.5">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${checkIconColor}`} />
                          <span className="text-slate-800 font-semibold">Lost & damaged airline baggage protection</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${checkIconColor}`} />
                          <span className="text-slate-800 font-semibold">Emergency dental pain coverage</span>
                        </div>
                      </>
                    )}

                    {plan.plan_code === 'MAX_PLUS' && (
                      <>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#00875A] flex-shrink-0 mt-0.5" />
                          <span className="text-[#00875A] font-bold">Active sports & extreme recreation included</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#00875A] flex-shrink-0 mt-0.5" />
                          <span className="text-[#00875A] font-bold">Civil legal liability & attorney hotline</span>
                        </div>
                      </>
                    )}

                    <div className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${checkIconColor}`} />
                      <span className="text-slate-700 font-medium">24/7 Multi-language WhatsApp & Assistance</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${btnStyle}`}
                  >
                    <span>Select {plan.plan_name}</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default PlanComparisonCards;
