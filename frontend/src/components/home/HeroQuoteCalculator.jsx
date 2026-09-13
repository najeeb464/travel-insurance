import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { destinationsApi, productsApi, quotesApi } from '../../api';
import { useBooking } from '../../context/BookingContext';

const HeroQuoteCalculator = () => {
  const {
    setCurrentStep,
    selectedDestination,
    setSelectedDestination,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    travelersAges,
    setTravelersAges,
    travelType,
    setTravelType,
    setCalculatedQuotes,
    calculateDays,
  } = useBooking();

  const [destinations, setDestinations] = useState([]);
  const [travelTypes, setTravelTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fallbackTravelTypes = [
    { id: '7c60920c-9c77-4808-af86-af7ff3ef0212', code: 'VISIT_VISA', name: 'Visit / Tourist Visa', description: 'Embassy-compliant insurance for Schengen, UK, US & Worldwide visitor visas' },
    { id: '6b6cf0c5-2955-4cc9-a4f4-7e11efa2e0cb', code: 'CALM', name: 'Calm / Leisure', description: 'Sightseeing, beach relaxation, museums, and business trips' },
    { id: '276b5dcd-6782-4a9d-afd6-2126163c0432', code: 'ACTIVE', name: 'Active / Sports', description: 'Amateur fitness, cycling, skiing on marked pistes, swimming, surfing' },
    { id: '4d791ba5-c754-4fa8-ab99-c80ed3fa2edb', code: 'EXTREME', name: 'Extreme / High Risk', description: 'Mountaineering, off-piste skiing, scuba diving, skydiving, paragliding' },
  ];

  const effectiveTravelTypes = travelTypes.length > 0 ? travelTypes : fallbackTravelTypes;

  useEffect(() => {
    // Load destinations
    destinationsApi.getDestinations()
      .then((res) => {
        const results = res.data.results || [];
        setDestinations(results);
        if (results.length > 0 && !selectedDestination) {
          const def = results.find(d => d.name.includes('Schengen')) || results[0];
          setSelectedDestination(def);
        }
      })
      .catch((err) => console.error('Failed to load destinations:', err));

    // Load travel types
    productsApi.getTravelTypes()
      .then((res) => {
        const types = res.data.results || [];
        const finalTypes = types.length > 0 ? types : fallbackTravelTypes;
        setTravelTypes(finalTypes);
        if (!travelType && finalTypes.length > 0) {
          const defaultType = finalTypes.find(t => t.code === 'VISIT_VISA') || finalTypes[0];
          setTravelType(defaultType);
        }
      })
      .catch((err) => {
        console.error('Failed to load travel types:', err);
        setTravelTypes(fallbackTravelTypes);
        if (!travelType) {
          setTravelType(fallbackTravelTypes[0]);
        }
      });
  }, []);

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.country_name && d.country_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddTraveler = () => {
    if (travelersAges.length < 8) {
      setTravelersAges([...travelersAges, 32]);
    }
  };

  const handleRemoveTraveler = (index) => {
    if (travelersAges.length > 1) {
      setTravelersAges(travelersAges.filter((_, i) => i !== index));
    }
  };

  const handleAgeChange = (index, value) => {
    const val = Math.max(0, Math.min(100, parseInt(value) || 0));
    const updated = [...travelersAges];
    updated[index] = val;
    setTravelersAges(updated);
  };

  const handleCalculateQuote = async (e) => {
    e.preventDefault();
    if (!selectedDestination) {
      setError('Please choose your destination');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select travel dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        destination_id: selectedDestination.id,
        start_date: startDate,
        end_date: endDate,
        travel_type_id: travelType ? travelType.id : null,
        travelers_ages: travelersAges,
      };

      const res = await quotesApi.calculate(payload);
      if (res.data.plan_options) {
        setCalculatedQuotes(res.data.plan_options);
        setCurrentStep(2);
        window.scrollTo({ top: 500, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to calculate quote. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  const durationDays = calculateDays();

  // Quick destination presets
  const popularPresets = [
    { name: 'Europe & Schengen', match: 'Schengen' },
    { name: 'Worldwide', match: 'Worldwide' },
    { name: 'USA & Canada', match: 'USA' },
    { name: 'Asia Pacific', match: 'Asia' },
  ];

  return (
    <section id="quote-section" className="relative bg-[#003D2B] text-white pt-12 pb-20 overflow-hidden">
      {/* Background Airplane Window Overlay Graphic */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-35 pointer-events-none hidden lg:block bg-no-repeat bg-right-top bg-cover" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1400&q=80')` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#003D2B] via-[#003D2B]/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Text */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#002E21]/80 border border-emerald-500/30 text-emerald-300 text-xs font-sans font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Cover that travels as fast as you do</span>
            </div>

            {/* Serif Heading */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.05]">
              Go farther. <br />
              <span className="italic text-emerald-200">Worry less.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-emerald-100/90 font-sans leading-relaxed max-w-xl">
              Flexible travel insurance, instant documents, and real human help—wherever your next story takes you.
            </p>

            {/* Feature Checkmarks */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm font-semibold text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>190+ destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Visit Visa & Embassy approved</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>24/7 support</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Instant Quote White Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 border border-slate-100">
              
              {/* Card Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#00875A] uppercase tracking-widest block">
                    INSTANT QUOTE
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                    Where are you headed?
                  </h2>
                </div>
                <span className="bg-emerald-100 text-[#00875A] font-bold text-xs px-3 py-1 rounded-full">
                  No obligation
                </span>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCalculateQuote} className="space-y-4">

                {/* Visit Visa Quick Mode Banner */}
                <div 
                  onClick={() => {
                    const visitType = effectiveTravelTypes.find(t => t.code === 'VISIT_VISA') || effectiveTravelTypes[0];
                    setTravelType(visitType);
                    if (!selectedDestination || (selectedDestination.destination_type !== 'SCHENGEN' && selectedDestination.destination_type !== 'WORLDWIDE')) {
                      const scheng = destinations.find(d => d.name.includes('Schengen')) || destinations[0];
                      if (scheng) setSelectedDestination(scheng);
                    }
                  }}
                  className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    travelType?.code === 'VISIT_VISA'
                      ? 'bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-[#00875A] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      travelType?.code === 'VISIT_VISA' ? 'bg-[#00875A] text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Visit Visa Travel Insurance</span>
                        <span className="text-[9px] bg-emerald-100 text-[#00875A] font-extrabold px-1.5 py-0.5 rounded">
                          100% Embassy Approved
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        Schengen €30k+, UK, US, Gulf & Global Visas • Zero Deductible
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 transition-colors ${
                    travelType?.code === 'VISIT_VISA'
                      ? 'bg-[#00875A] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}>
                    {travelType?.code === 'VISIT_VISA' ? 'Selected ✓' : 'Select'}
                  </span>
                </div>
                
                {/* Destination Quick Selector Grid */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    DESTINATION
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {popularPresets.map((preset, idx) => {
                      const matchedDest = destinations.find(d => d.name.toLowerCase().includes(preset.match.toLowerCase()));
                      const isSelected = selectedDestination && (
                        selectedDestination.name.toLowerCase().includes(preset.match.toLowerCase()) ||
                        (idx === 0 && selectedDestination.destination_type === 'SCHENGEN')
                      );

                      return (
                        <button
                          type="button"
                          key={preset.name}
                          onClick={() => {
                            if (matchedDest) {
                              setSelectedDestination(matchedDest);
                            }
                          }}
                          className={`p-3 text-xs font-bold rounded-xl transition-all text-center border ${
                            isSelected
                              ? 'bg-[#00875A] text-white border-[#00875A] shadow-md shadow-emerald-700/20'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Search Select Dropdown Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDestDropdown(!showDestDropdown)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00875A]" />
                        <span>Selected: <strong className="text-slate-900">{selectedDestination ? selectedDestination.name : 'Select Country'}</strong></span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showDestDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 right-0 mt-1 p-2 bg-white rounded-xl border border-slate-200 shadow-xl z-30 space-y-2"
                        >
                          <input
                            type="text"
                            placeholder="Type country or region..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {filteredDestinations.map((dest) => (
                              <div
                                key={dest.id}
                                onClick={() => {
                                  setSelectedDestination(dest);
                                  setShowDestDropdown(false);
                                }}
                                className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer ${
                                  selectedDestination?.id === dest.id
                                    ? 'bg-emerald-50 text-[#00875A] font-bold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span>{dest.name}</span>
                                {dest.is_popular && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-[#00875A]">
                                    Popular
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Dates Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      DEPARTURE DATE
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      RETURN DATE
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Travellers Counter and Age Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      TRAVELLERS
                    </label>
                    <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleRemoveTraveler(travelersAges.length - 1)}
                        disabled={travelersAges.length <= 1}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-slate-900">{travelersAges.length}</span>
                      <button
                        type="button"
                        onClick={handleAddTraveler}
                        disabled={travelersAges.length >= 8}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      OLDEST TRAVELLER'S AGE
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={travelersAges[0] || 32}
                      onChange={(e) => handleAgeChange(0, e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                    />
                  </div>
                </div>

                {/* Trip Style / Risk Pills */}
                {effectiveTravelTypes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        TRIP STYLE / PURPOSE
                      </label>
                      {travelType?.code === 'VISIT_VISA' && (
                        <span className="text-[10px] text-[#00875A] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
                          Embassy Compliant
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {effectiveTravelTypes.map((tt) => {
                        const isSelected = travelType?.id === tt.id || travelType?.code === tt.code;
                        const isVisa = tt.code === 'VISIT_VISA';
                        return (
                          <button
                            type="button"
                            key={tt.id || tt.code}
                            onClick={() => setTravelType(tt)}
                            className={`p-2.5 text-xs font-bold rounded-xl transition-all text-left flex flex-col justify-between border ${
                              isSelected
                                ? 'bg-[#00875A] text-white border-[#00875A] shadow-md shadow-emerald-700/20'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{tt.name}</span>
                              {isVisa && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                                  isSelected ? 'bg-emerald-900 text-emerald-100' : 'bg-emerald-100 text-[#00875A]'
                                }`}>
                                  Visa Ready
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-normal truncate mt-0.5 ${
                              isSelected ? 'text-emerald-100' : 'text-slate-400'
                            }`}>
                              {isVisa ? 'Schengen, UK, US, Gulf' : tt.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Reassurance banner if Visit Visa is selected */}
                    {travelType?.code === 'VISIT_VISA' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300/80 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#00875A]">
                          <ShieldCheck className="w-4 h-4 text-[#00875A] flex-shrink-0" />
                          <span>100% Embassy & Consulate Guaranteed</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Meets European Parliament Regulation (EC) No 810/2009 for Schengen visas & worldwide consulates: €30,000+ medical cover, zero deductible, repatriation + 100% money-back guarantee on visa refusal.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Compare CTA Button */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Calculating quotes...</span>
                      </div>
                    ) : (
                      <>
                        <span>Compare cover options</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                  <p className="text-[10px] text-slate-400 text-center font-medium mt-2">
                    Takes less than 2 minutes · No payment required
                  </p>
                </div>

              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroQuoteCalculator;
