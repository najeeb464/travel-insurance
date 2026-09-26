import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroQuoteCalculator from './components/home/HeroQuoteCalculator';
import PlanComparisonCards from './components/booking/PlanComparisonCards';
import TravelerForm from './components/booking/TravelerForm';
import PolicySuccessView from './components/policy/PolicySuccessView';
import PaymentModal from './components/booking/PaymentModal';
import ValidateInsuranceModal from './components/policy/ValidateInsuranceModal';
import PublicPolicyModal from './components/policy/PublicPolicyModal';
import AuthModal from './components/customer/AuthModal';
import UserDashboard from './components/customer/UserDashboard';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import RefundRequestModal from './components/customer/RefundRequestModal';
import PageModal from './components/cms/PageModal';
import WhyChooseUs from './components/home/WhyChooseUs';
import HowItWorks from './components/home/HowItWorks';
import StoriesBanner from './components/home/StoriesBanner';
import ReviewsSection from './components/home/ReviewsSection';
import FaqSection from './components/home/FaqSection';

const stepVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: 'easeIn' } },
};

const AppContent = () => {
  const { currentStep, setIssuedPolicy, setCurrentStep } = useBooking();

  // Modal states
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [validatePolicyNumber, setValidatePolicyNumber] = useState('');
  const [isPublicVerifyOpen, setIsPublicVerifyOpen] = useState(false);
  const [publicVerifyPolicyNumber, setPublicVerifyPolicyNumber] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundOrderNumber, setRefundOrderNumber] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingOrderForPayment, setPendingOrderForPayment] = useState(null);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [pageModalSlug, setPageModalSlug] = useState('terms');

  const handleOpenValidate = (policyNum = '') => {
    setValidatePolicyNumber(policyNum);
    setIsValidateModalOpen(true);
  };

  const handleOpenPublicVerify = (policyNum = '') => {
    setPublicVerifyPolicyNumber(policyNum);
    setIsPublicVerifyOpen(true);
  };

  const handleOpenRefund = (orderNum = '') => {
    setRefundOrderNumber(orderNum);
    setIsRefundModalOpen(true);
  };

  const handleOpenPayment = (orderData) => {
    setPendingOrderForPayment(orderData);
    setIsPaymentModalOpen(true);
  };

  const handleOpenPage = (slug = 'terms') => {
    setPageModalSlug(slug);
    setIsPageModalOpen(true);
  };

  // Listen for query params (?verify=TAYARA-...) and hash-based deep linking
  useEffect(() => {
    const checkUrlForActions = () => {
      // 1. Check URL query parameters (e.g. from QR code scan: /?verify=TAYARA-2026-...)
      const params = new URLSearchParams(window.location.search);
      const verifyParam = params.get('verify') || params.get('validate') || params.get('policy');
      if (verifyParam) {
        handleOpenPublicVerify(verifyParam);
        return;
      }

      if (params.get('admin') === 'true') {
        setIsAdminDashboardOpen(true);
        return;
      }

      // 2. Check hash actions
      const hash = window.location.hash.toLowerCase().replace(/^#/, '');
      if (hash === 'admin' || hash === 'admin-dashboard' || hash === 'dashboard-admin') {
        setIsAdminDashboardOpen(true);
        return;
      }
      if (hash.startsWith('verify/')) {
        const num = window.location.hash.replace(/^#verify\//i, '');
        if (num) {
          handleOpenPublicVerify(num);
          return;
        }
      }

      if (['terms', 'terms-and-conditions', 'privacy', 'privacy-policy', 'about', 'about-us', 'refund-policy', 'refunds'].includes(hash)) {
        handleOpenPage(hash);
      }
    };

    checkUrlForActions();
    window.addEventListener('hashchange', checkUrlForActions);
    window.addEventListener('popstate', checkUrlForActions);
    return () => {
      window.removeEventListener('hashchange', checkUrlForActions);
      window.removeEventListener('popstate', checkUrlForActions);
    };
  }, []);

  const handleViewPolicyFromDashboard = (policy) => {
    setIssuedPolicy(policy);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar
        onOpenValidateModal={() => handleOpenValidate()}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenPage={handleOpenPage}
      />

      {/* Dynamic Content based on Booking Step */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <HeroQuoteCalculator />
              <WhyChooseUs />
              <HowItWorks />
              <StoriesBanner />
              <ReviewsSection />
              <FaqSection onOpenValidateModal={() => handleOpenValidate()} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PlanComparisonCards />
              <WhyChooseUs />
              <FaqSection onOpenValidateModal={() => handleOpenValidate()} />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <TravelerForm onOpenPaymentModal={handleOpenPayment} />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step-4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PolicySuccessView onOpenValidateModal={handleOpenValidate} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        onOpenValidateModal={() => handleOpenValidate()}
        onOpenRefundModal={() => handleOpenRefund()}
        onOpenPage={handleOpenPage}
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
        onOpenPublicVerify={handleOpenPublicVerify}
      />

      <PublicPolicyModal
        isOpen={isPublicVerifyOpen}
        onClose={() => setIsPublicVerifyOpen(false)}
        policyNumber={publicVerifyPolicyNumber}
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
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onViewPolicy={handleOpenPublicVerify}
      />

      <RefundRequestModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        initialOrderNumber={refundOrderNumber}
      />

      <PageModal
        isOpen={isPageModalOpen}
        onClose={() => setIsPageModalOpen(false)}
        initialSlug={pageModalSlug}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
