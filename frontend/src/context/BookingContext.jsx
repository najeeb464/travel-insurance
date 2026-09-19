import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

const SESSION_KEY = 'tayara_booking_session';

const loadSavedSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || sessionStorage.getItem('tavara_booking_session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const BookingProvider = ({ children }) => {
  const saved = loadSavedSession();

  // Step indicator: 1 = Quote Calculator, 2 = Plan Selection, 3 = Traveler Info, 4 = Success / Policy View
  const [currentStep, setCurrentStep] = useState(saved?.currentStep || 1);

  // Search parameters
  const [selectedDestination, setSelectedDestination] = useState(saved?.selectedDestination || null);
  const [startDate, setStartDate] = useState(() => {
    if (saved?.startDate) return saved.startDate;
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    if (saved?.endDate) return saved.endDate;
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [travelersAges, setTravelersAges] = useState(saved?.travelersAges || [30]);
  const [travelType, setTravelType] = useState(saved?.travelType || null); // CALM / ACTIVE / EXTREME

  // Quotation comparison data
  const [calculatedQuotes, setCalculatedQuotes] = useState(saved?.calculatedQuotes || []);
  const [selectedPlanOption, setSelectedPlanOption] = useState(saved?.selectedPlanOption || null);
  const [selectedAddonIds, setSelectedAddonIds] = useState(saved?.selectedAddonIds || []);
  const [appliedPromo, setAppliedPromo] = useState(saved?.appliedPromo || null);

  // Current active quote & order
  const [activeQuote, setActiveQuote] = useState(saved?.activeQuote || null);
  const [activeOrder, setActiveOrder] = useState(saved?.activeOrder || null);
  const [issuedPolicy, setIssuedPolicy] = useState(saved?.issuedPolicy || null);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      const sessionData = {
        currentStep,
        selectedDestination,
        startDate,
        endDate,
        travelersAges,
        travelType,
        calculatedQuotes,
        selectedPlanOption,
        selectedAddonIds,
        appliedPromo,
        activeQuote,
        activeOrder,
        issuedPolicy,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {
      // Ignore quota/storage errors
    }
  }, [
    currentStep,
    selectedDestination,
    startDate,
    endDate,
    travelersAges,
    travelType,
    calculatedQuotes,
    selectedPlanOption,
    selectedAddonIds,
    appliedPromo,
    activeQuote,
    activeOrder,
    issuedPolicy,
  ]);

  // Helper to calculate duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e - s;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };

  const resumeQuote = (quote) => {
    if (!quote) return;
    if (quote.destination_details) {
      setSelectedDestination(quote.destination_details);
    }
    if (quote.start_date) setStartDate(quote.start_date);
    if (quote.end_date) setEndDate(quote.end_date);
    if (quote.travelers && quote.travelers.length > 0) {
      setTravelersAges(quote.travelers.map((t) => t.age));
    }

    const planOption = {
      quote_number: quote.quote_number,
      quote_id: quote.id,
      plan_id: quote.plan_details?.id,
      plan_name: quote.plan_details?.name,
      plan_code: quote.plan_details?.code,
      medical_limit_display: quote.plan_details?.medical_limit_display,
      pricing: quote.breakdown_data || {
        final_total: quote.total,
        currency: quote.currency,
        subtotal: quote.subtotal,
        total_discount: quote.discount,
      },
      coverages: quote.plan_details?.coverages || [],
    };

    setSelectedPlanOption(planOption);
    setActiveQuote(quote);
    setCurrentStep(3);
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedPlanOption(null);
    setSelectedAddonIds([]);
    setAppliedPromo(null);
    setActiveQuote(null);
    setActiveOrder(null);
    setIssuedPolicy(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  };

  return (
    <BookingContext.Provider
      value={{
        currentStep,
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
        calculatedQuotes,
        setCalculatedQuotes,
        selectedPlanOption,
        setSelectedPlanOption,
        selectedAddonIds,
        setSelectedAddonIds,
        appliedPromo,
        setAppliedPromo,
        activeQuote,
        setActiveQuote,
        activeOrder,
        setActiveOrder,
        issuedPolicy,
        setIssuedPolicy,
        calculateDays,
        resumeQuote,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
