import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  // Step indicator: 1 = Quote Calculator, 2 = Plan Selection, 3 = Traveler Info, 4 = Success / Policy View
  const [currentStep, setCurrentStep] = useState(1);

  // Search parameters
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [travelersAges, setTravelersAges] = useState([30]);
  const [travelType, setTravelType] = useState(null); // CALM / ACTIVE / EXTREME

  // Quotation comparison data
  const [calculatedQuotes, setCalculatedQuotes] = useState([]);
  const [selectedPlanOption, setSelectedPlanOption] = useState(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Current active quote & order
  const [activeQuote, setActiveQuote] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [issuedPolicy, setIssuedPolicy] = useState(null);

  // Helper to calculate duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e - s;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedPlanOption(null);
    setSelectedAddonIds([]);
    setAppliedPromo(null);
    setActiveQuote(null);
    setActiveOrder(null);
    setIssuedPolicy(null);
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
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
