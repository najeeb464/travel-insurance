import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2
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

  useEffect(() => {
    // Load destinations
    destinationsApi.getDestinations()
      .then((res) => {
        const results = res.data.results || [];
        setDestinations(results);
        if (results.length > 0 && !selectedDestination) {
          // Default to Schengen or Worldwide
          const def = results.find(d => d.name.includes('Schengen')) || results[0];
          setSelectedDestination(def);
        }
      })
      .catch((err) => console.error('Failed to load destinations:', err));

    // Load travel types
    productsApi.getTravelTypes()
      .then((res) => {
        const types = res.data.results || [];
        setTravelTypes(types);
        if (types.length > 0 && !travelType) {
          setTravelType(types[0]); // Calm default
        }
      })
      .catch((err) => console.error('Failed to load travel types:', err));
  }, []);

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.country_name && d.country_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddTraveler = () => {
    if (travelersAges.length < 8) {
      setTravelersAges([...travelersAges, 30]);
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
        setCurrentStep(2); // Jump to Step 2: Plan Selection
        // Smooth scroll to options
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

  return (
    <section id="quote-section" className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-slate-900 via-brand-950 to-slate-900 text-white">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-600/20 via-blue-500/10 to-indigo-500/0 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Hero Text */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-400/30 text-brand-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Digital Travel Insurance for Global Citizens & Tourists</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Travel Securely. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-blue-200 to-white">
              Instant Policy in 2 Minutes.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
            100% accepted by Schengen consulates, European embassies, and immigration checkpoints worldwide. Zero deductible, instant PDF issuance.
          </p>

          {/* Quick trust metrics */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>€30,000+ Schengen Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>COVID-19 Full Medical Cover</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>24/7 Multi-language Assistance</span>
            </div>
          </div>
        </div>

        {/* Floating Quote Calculator Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-black/40 border border-slate-100 p-6 sm:p-8 text-slate-800">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCalculateQuote} className="space-y-6">
            {/* Field 1: Destination Selection */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Where are you traveling to?
              </label>
              
              <div className="relative">
                <div 
                  onClick={() => setShowDestDropdown(!showDestDropdown)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900">
                        {selectedDestination ? selectedDestination.name : 'Select Destination'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedDestination?.destination_type === 'SCHENGEN' ? 'Covers all 29 European Schengen member countries' : 'Valid worldwide & accepted by consular authorities'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg">
                    Change
                  </span>
                </div>

                {/* Dropdown popup */}
                {showDestDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 space-y-3">
                    <input
                      type="text"
                      placeholder="Search destination, country or zone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      autoFocus
                    />

                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredDestinations.map((dest) => (
                        <div
                          key={dest.id}
                          onClick={() => {
                            setSelectedDestination(dest);
                            setShowDestDropdown(false);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                            selectedDestination?.id === dest.id 
                              ? 'bg-brand-50 text-brand-700 font-bold' 
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{dest.name}</span>
                          </div>
                          {dest.is_popular && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Popular
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Select Destination Chips */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {destinations.filter(d => d.is_popular).slice(0, 5).map((pop) => (
                  <button
                    type="button"
                    key={pop.id}
                    onClick={() => setSelectedDestination(pop)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      selectedDestination?.id === pop.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pop.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Dates & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Departure Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Return Date ({durationDays} {durationDays === 1 ? 'day' : 'days'})
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Field 3: Travelers & Ages */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Insured Travelers ({travelersAges.length})
                </label>
                {travelersAges.length < 8 && (
                  <button
                    type="button"
                    onClick={handleAddTraveler}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Tourist</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {travelersAges.map((age, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-600">
                        Traveler #{idx + 1}
                      </span>
                      {travelersAges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTraveler(idx)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Age:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={age}
                        onChange={(e) => handleAgeChange(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field 4: Travel Activity / Risk Type */}
            {travelTypes.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Activity & Travel Risk Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {travelTypes.map((tt) => {
                    const isSelected = travelType?.id === tt.id;
                    return (
                      <div
                        key={tt.id}
                        onClick={() => setTravelType(tt)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-bold ${isSelected ? 'text-brand-900' : 'text-slate-800'}`}>
                            {tt.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                            x{tt.risk_multiplier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {tt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Action CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-500/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Calculating Best Quotations...</span>
                  </div>
                ) : (
                  <>
                    <span>Compare Tariffs & Get Instant Quote</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroQuoteCalculator;
