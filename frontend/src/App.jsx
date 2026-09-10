import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroQuoteCalculator from './components/home/HeroQuoteCalculator';
import PlanComparisonCards from './components/booking/PlanComparisonCards';
import TravelerForm from './components/booking/TravelerForm';
import PolicySuccessView from './components/policy/PolicySuccessView';
import PaymentModal from './components/booking/PaymentModal';
import ValidateInsuranceModal from './components/policy/ValidateInsuranceModal';
import AuthModal from './components/customer/AuthModal';
import UserDashboard from './components/customer/UserDashboard';
import RefundRequestModal from './components/customer/RefundRequestModal';
import WhyChooseUs from './components/home/WhyChooseUs';
import HowItWorks from './components/home/HowItWorks';
import ReviewsSection from './components/home/ReviewsSection';
import FaqSection from './components/home/FaqSection';

const AppContent = () => {
  const { currentStep, setIssuedPolicy, setCurrentStep } = useBooking();

  // Modal states
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [validatePolicyNumber, setValidatePolicyNumber] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundOrderNumber, setRefundOrderNumber] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingOrderForPayment, setPendingOrderForPayment] = useState(null);

  const handleOpenValidate = (policyNum = '') => {
    setValidatePolicyNumber(policyNum);
    setIsValidateModalOpen(true);
  };

  const handleOpenRefund = (orderNum = '') => {
    setRefundOrderNumber(orderNum);
    setIsRefundModalOpen(true);
  };

  const handleOpenPayment = (orderData) => {
    setPendingOrderForPayment(orderData);
    setIsPaymentModalOpen(true);
  };

  const handleViewPolicyFromDashboard = (policy) => {
    setIssuedPolicy(policy);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <Navbar
        onOpenValidateModal={() => handleOpenValidate()}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Dynamic Content based on Booking Step */}
      <main className="flex-grow">
        {currentStep === 1 && (
          <>
            <HeroQuoteCalculator />
            <WhyChooseUs />
            <HowItWorks />
            <ReviewsSection />
            <FaqSection onOpenValidateModal={() => handleOpenValidate()} />
          </>
        )}

        {currentStep === 2 && (
          <>
            <PlanComparisonCards />
            <WhyChooseUs />
            <FaqSection onOpenValidateModal={() => handleOpenValidate()} />
          </>
        )}

        {currentStep === 3 && (
          <TravelerForm onOpenPaymentModal={handleOpenPayment} />
        )}

        {currentStep === 4 && (
          <PolicySuccessView onOpenValidateModal={handleOpenValidate} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenValidateModal={() => handleOpenValidate()}
        onOpenRefundModal={() => handleOpenRefund()}
      />

      {/* Global Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderData={pendingOrderForPayment}
      />

      <ValidateInsuranceModal
        isOpen={isValidateModalOpen}
        onClose={() => setIsValidateModalOpen(false)}
        initialPolicyNumber={validatePolicyNumber}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <UserDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onSelectPolicyForView={handleViewPolicyFromDashboard}
        onOpenRefundModal={handleOpenRefund}
      />

      <RefundRequestModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        initialOrderNumber={refundOrderNumber}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppContent />
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;
