import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Calculator,
  ArrowRight,
  Trash2,
  Ban,
  BarChart3
} from 'lucide-react';
import { policiesApi, ordersApi, quotesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

const UserDashboard = ({ isOpen, onClose, onSelectPolicyForView, onOpenRefundModal, onOpenAdminDashboard }) => {
  const { user } = useAuth();
  const { resumeQuote } = useBooking();
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      Promise.all([
        policiesApi.getMyPolicies().catch(() => ({ data: { results: [] } })),
        ordersApi.getMyOrders().catch(() => ({ data: { results: [] } })),
        quotesApi.getMyQuotes().catch(() => ({ data: { results: [] } })),
      ]).then(([polRes, ordRes, quoRes]) => {
        setPolicies(polRes.data.results || polRes.data || []);
        setOrders(ordRes.data.results || ordRes.data || []);
        setQuotes(quoRes.data.results || quoRes.data || []);
      }).finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  const handleDeleteQuote = async (quoteNumber) => {
    if (!window.confirm(`Are you sure you want to discard quote ${quoteNumber}?`)) return;
    setActionLoading(quoteNumber);
    try {
      await quotesApi.deleteQuote(quoteNumber);
      setQuotes((prev) => prev.filter((q) => q.quote_number !== quoteNumber));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove quote.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderNumber) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderNumber}?`)) return;
    setActionLoading(orderNumber);
    try {
      await ordersApi.cancel(orderNumber);
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, status: 'CANCELLED' } : o))
      );
      // Refresh quotes since quote was released back to CALCULATED
      quotesApi.getMyQuotes().then((res) => {
        setQuotes(res.data.results || res.data || []);
      }).catch(() => {});
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (orderNumber) => {
    if (!window.confirm(`Permanently remove cancelled order ${orderNumber} from your list?`)) return;
    setActionLoading(orderNumber);
    try {
      await ordersApi.deleteOrder(orderNumber);
      setOrders((prev) => prev.filter((o) => o.order_number !== orderNumber));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove order.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
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
            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Tayara Client Dashboard</span>
                  {(user.is_staff || user.is_superuser || user.role === 'ADMIN' || user.role === 'STAFF') && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdminDashboard && onOpenAdminDashboard();
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                      title="Open Admin Statistics Dashboard"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Switch to Admin Portal</span>
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-bold">{user.first_name ? `${user.first_name} ${user.last_name}` : user.email}</h3>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50 text-sm font-bold">
              <button
                onClick={() => setActiveTab('policies')}
                className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'policies'
                    ? 'border-[#00875A] text-[#00875A] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Issued Policies ({policies.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('quotes')}
                className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'quotes'
                    ? 'border-[#00875A] text-[#00875A] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Saved Quotes ({quotes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-[#00875A] text-[#00875A] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>My Orders ({orders.length})</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {loading ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs">
                  Loading dashboard entries...
                </div>
              ) : activeTab === 'policies' ? (
                policies.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-3">
                    <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-medium">No issued policies found under this account.</p>
                  </div>
                ) : (
                  policies.map((pol) => (
                    <div
                      key={pol.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#00875A]">{pol.policy_number}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#00875A] text-[10px] font-bold">
                            {pol.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{pol.plan_name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          {pol.destination_name} • {pol.start_date} to {pol.end_date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectPolicyForView(pol);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00875A] hover:bg-[#00734c] shadow-sm flex items-center gap-1.5"
                        >
                          <span>View Certificate</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : activeTab === 'quotes' ? (
                quotes.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-3">
                    <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-medium">No saved quotes found under this account.</p>
                  </div>
                ) : (
                  quotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#00875A]">{q.quote_number}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.status === 'CONVERTED' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-emerald-100 text-[#00875A]'
                          }`}>
                            {q.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {q.plan_details?.name || 'Travel Insurance Plan'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          {q.destination_details?.name} • {q.start_date} to {q.end_date} • {q.travelers?.length || 1} traveler(s)
                        </p>
                        <div className="text-sm font-bold text-[#00875A] mt-1">
                          €{q.total} {q.currency}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {q.status !== 'CONVERTED' ? (
                          <>
                            <button
                              onClick={() => {
                                onClose();
                                resumeQuote(q);
                                window.scrollTo({ top: 100, behavior: 'smooth' });
                              }}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#00875A] hover:bg-[#00734c] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span>Resume</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteQuote(q.quote_number)}
                              disabled={actionLoading === q.quote_number}
                              className="p-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer"
                              title="Discard this quote"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Converted to Order
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-medium">No order history found.</p>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">Order #{ord.order_number}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'ISSUED' || ord.status === 'PAID'
                              ? 'bg-emerald-100 text-[#00875A]'
                              : ord.status === 'CANCELLED'
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">€{ord.total} {ord.currency}</h4>
                        <p className="text-xs text-slate-500 font-mono">Status: {ord.status}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.status === 'PENDING_PAYMENT' && (
                          <button
                            onClick={() => handleCancelOrder(ord.order_number)}
                            disabled={actionLoading === ord.order_number}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Cancel unissued order"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel Order</span>
                          </button>
                        )}

                        {ord.status === 'CANCELLED' && (
                          <button
                            onClick={() => handleDeleteOrder(ord.order_number)}
                            disabled={actionLoading === ord.order_number}
                            className="p-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer"
                            title="Remove cancelled order from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {ord.status === 'PAID' && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenRefundModal(ord.order_number);
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Request Refund</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserDashboard;
