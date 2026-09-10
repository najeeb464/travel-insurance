import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Check
} from 'lucide-react';
import { paymentsApi } from '../../api';
import { useBooking } from '../../context/BookingContext';

const PaymentModal = ({ isOpen, onClose, orderData }) => {
  const { setIssuedPolicy, setCurrentStep } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState('CARD'); // CARD, APPLE_PAY, PAYPAL
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(orderData?.contact_full_name || 'JOHN DOE');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !orderData) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await paymentsApi.checkout({
        order_number: orderData.order_number,
        provider: 'MOCK',
        payment_method: selectedMethod,
        simulate_failure: simulateFailure,
      });

      if (res.data.policy) {
        setIssuedPolicy(res.data.policy);
        onClose();
        setCurrentStep(4); // Move to Step 4: Policy Success & Certificate view
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">EKTA Secure Payment</h3>
              <p className="text-xs text-slate-400">Order: {orderData.order_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount to pay banner */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Amount Due</span>
            <div className="text-2xl font-black text-slate-900">€{orderData.total} {orderData.currency}</div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Policy Delivery</span>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instant (under 2 min)</span>
            </div>
          </div>
        </div>

        {/* Form contents */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'CARD'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 ring-2 ring-brand-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-brand-600" />
                <span>Card (Visa/MC)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('APPLE_PAY')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'APPLE_PAY'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 ring-2 ring-brand-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-slate-900" />
                <span>Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('PAYPAL')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'PAYPAL'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 ring-2 ring-brand-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="font-black italic text-blue-800 text-sm">P</span>
                <span>PayPal</span>
              </button>
            </div>
          </div>

          {/* Simulated Card Fields */}
          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 text-sm font-mono font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Expiry MM/YY
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  CVC / CVV
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            {/* Test Simulation Mode Helper */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <span className="font-semibold">Simulate Decline?</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded border-amber-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[11px]">Test failed payment</span>
              </label>
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Payment & Issuing Policy...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay €{orderData.total} & Issue Policy</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security footnote */}
          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted with 256-Bit SSL Certificate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
