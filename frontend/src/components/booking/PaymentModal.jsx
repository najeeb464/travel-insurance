import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { paymentsApi } from '../../api';
import { useBooking } from '../../context/BookingContext';

const PaymentModal = ({ isOpen, onClose, orderData }) => {
  const { setIssuedPolicy, setCurrentStep } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState('CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(orderData?.contact_full_name || 'JOHN DOE');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await paymentsApi.checkout({
        order_number: orderData?.order_number,
        provider: 'MOCK',
        payment_method: selectedMethod,
        simulate_failure: simulateFailure,
      });

      if (res.data.policy) {
        setIssuedPolicy(res.data.policy);
        onClose();
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Payment failed. Please verify your card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && orderData && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">AeroSure Encrypted Checkout</h3>
                  <p className="text-xs font-mono text-slate-400">Order Ref: {orderData.order_number}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount banner */}
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-500">Total Amount Due</span>
                <div className="text-2xl font-serif font-bold text-[#00875A]">€{orderData.total} {orderData.currency}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-500">Certificate Status</span>
                <div className="text-xs font-bold text-[#00875A] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>Ready for Instant Issue</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('CARD')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      selectedMethod === 'CARD'
                        ? 'bg-[#00875A] text-white border-[#00875A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('APPLE_PAY')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      selectedMethod === 'APPLE_PAY'
                        ? 'bg-[#00875A] text-white border-[#00875A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Apple Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('PAYPAL')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      selectedMethod === 'PAYPAL'
                        ? 'bg-[#00875A] text-white border-[#00875A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <span>PayPal</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handlePay} className="space-y-4">
                {selectedMethod === 'CARD' && (
                  <>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Simulation toggle */}
                <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      className="rounded text-[#00875A] focus:ring-emerald-500"
                    />
                    <span>Simulate Payment Failure (Testing)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Processing Payment...' : `Pay €${orderData.total} & Generate Certificate`}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
