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
  RefreshCw
} from 'lucide-react';
import { policiesApi, ordersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = ({ isOpen, onClose, onSelectPolicyForView, onOpenRefundModal }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      Promise.all([
        policiesApi.getMyPolicies().catch(() => ({ data: { results: [] } })),
        ordersApi.getMyOrders().catch(() => ({ data: { results: [] } })),
      ]).then(([polRes, ordRes]) => {
        setPolicies(polRes.data.results || polRes.data || []);
        setOrders(ordRes.data.results || ordRes.data || []);
      }).finally(() => setLoading(false));
    }
  }, [isOpen, user]);

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
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">AeroSure Client Dashboard</span>
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
                className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'policies'
                    ? 'border-[#00875A] text-[#00875A] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Issued Policies ({policies.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
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
                        <span className="text-xs font-mono text-slate-500">Order #{ord.order_number}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">€{ord.total} {ord.currency}</h4>
                        <p className="text-xs text-slate-500 font-mono">Status: {ord.status}</p>
                      </div>

                      {ord.status === 'PAID' && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenRefundModal(ord.order_number);
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Request Refund</span>
                        </button>
                      )}
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
