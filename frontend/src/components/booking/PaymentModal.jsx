import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { paymentsApi } from '../../api';
import { useBooking } from '../../context/BookingContext';
import { useCurrency } from '../../context/CurrencyContext';

const PaymentModal = ({ isOpen, onClose, orderData }) => {
  const { setIssuedPolicy, setCurrentStep } = useBooking();
  const { formatPrice } = useCurrency();
  const formattedPrice = formatPrice(orderData?.total || 0);
  const [selectedMethod, setSelectedMethod] = useState('PAYPAL');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(orderData?.contact_full_name || 'JOHN DOE');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paypalConfig, setPaypalConfig] = useState(null);
  const [sdkLoading, setSdkLoading] = useState(false);

  const paypalContainerRef = useRef(null);

  // Fetch PayPal public config when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      paymentsApi.getConfig()
        .then((res) => {
          setPaypalConfig(res.data);
          if (res.data?.paypal_enabled) {
            setSelectedMethod('PAYPAL');
          }
        })
        .catch((err) => {
          console.warn('Could not load payment configuration:', err);
        });
    }
  }, [isOpen]);

  // Load PayPal JavaScript SDK and render Smart Buttons
  useEffect(() => {
    if (!isOpen || !orderData || selectedMethod !== 'PAYPAL' || !paypalConfig?.paypal_client_id) {
      return;
    }

    const scriptId = 'paypal-sdk-script';
    let script = document.getElementById(scriptId);

    const renderButtons = () => {
      if (!window.paypal || !paypalContainerRef.current) return;
      paypalContainerRef.current.innerHTML = '';

      try {
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48,
          },
          createOrder: async () => {
            setError('');
            setLoading(true);
            try {
              const res = await paymentsApi.createPaypalOrder({
                order_number: orderData.order_number,
              });
              return res.data.paypal_order_id;
            } catch (err) {
              const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to initialize PayPal order.';
              setError(msg);
              setLoading(false);
              throw err;
            }
          },
          onApprove: async (data) => {
            setLoading(true);
            setError('');
            try {
              const res = await paymentsApi.capturePaypalOrder({
                order_number: orderData.order_number,
                paypal_order_id: data.orderID,
              });

              if (res.data.policy) {
                setIssuedPolicy(res.data.policy);
                onClose();
                setCurrentStep(4);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setError('Payment completed, but failed to retrieve policy.');
              }
            } catch (err) {
              console.error('PayPal capture error:', err);
              setError(err.response?.data?.error || err.response?.data?.message || 'Failed to capture PayPal payment.');
            } finally {
              setLoading(false);
            }
          },
          onError: (err) => {
            console.error('PayPal Buttons Error:', err);
            setError('An error occurred during the PayPal checkout process.');
            setLoading(false);
          },
          onCancel: () => {
            setLoading(false);
          },
        }).render(paypalContainerRef.current);
      } catch (renderErr) {
        console.error('Failed to render PayPal Buttons:', renderErr);
      }
    };

    if (window.paypal) {
      renderButtons();
    } else if (script) {
      script.addEventListener('load', renderButtons);
    } else {
      setSdkLoading(true);
      const currency = (orderData?.currency || paypalConfig?.currency || 'USD').toUpperCase();
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalConfig.paypal_client_id)}&currency=${currency}&intent=capture`;
      script.async = true;
      script.onload = () => {
        setSdkLoading(false);
        renderButtons();
      };
      script.onerror = () => {
        setSdkLoading(false);
        setError('Failed to load PayPal secure payment SDK. Please verify your connection.');
      };
      document.body.appendChild(script);
    }
  }, [isOpen, orderData?.order_number, selectedMethod, paypalConfig]);

  // Fallback simulated card checkout
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
                  <h3 className="text-base font-bold">Tayara Encrypted Checkout</h3>
                  <p className="text-xs font-mono text-slate-400">Order Ref: {orderData.order_number}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount banner */}
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Total Settlement (USD)</span>
                <div className="text-2xl font-serif font-bold text-[#00875A]">${orderData.total} USD</div>
                {formattedPrice.approxText && (
                  <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                    {formattedPrice.approxText} <span className="text-[10px] text-slate-500 font-normal">(approx. charged by your bank)</span>
                  </div>
                )}
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

              {/* Official Payment Gateway Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00875A] text-white flex items-center justify-center font-serif font-black italic text-base shadow-sm">
                    P
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Official PayPal Gateway</span>
                      {paypalConfig?.paypal_mode === 'sandbox' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-400 text-slate-900 font-black">
                          SANDBOX
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                      PayPal Account • Debit or Credit Card • Visa • Mastercard • AMEX
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-[#00875A]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit SSL</span>
                </div>
              </div>

              {/* PayPal Smart Buttons View */}
              <div className="space-y-4">
                {paypalConfig?.paypal_enabled ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#00875A]" />
                        Official PayPal Buyer Protection
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">256-Bit SSL</span>
                    </div>

                    {sdkLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs font-mono">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00875A]" />
                        <span>Connecting to PayPal Gateway...</span>
                      </div>
                    ) : (
                      <div className="min-h-[100px] flex flex-col justify-center">
                        <div ref={paypalContainerRef} className="w-full z-10" />
                      </div>
                    )}

                    {loading && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#00875A] font-bold text-center flex items-center justify-center gap-2 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Finalizing transaction & issuing policy certificate...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>PayPal Gateway Setup Required</span>
                    </div>
                    <p className="leading-relaxed">
                      To accept live online payments, add your PayPal <strong>Client ID</strong> and <strong>Client Secret</strong> in your backend settings.
                    </p>
                  </div>
                )}
              </div>

              {/* Note: Direct card form is disabled. Reserved for future direct gateway additions (e.g., Stripe / Checkout.com). */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;

