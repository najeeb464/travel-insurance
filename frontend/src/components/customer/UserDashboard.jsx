import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  ShoppingBag, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { policiesApi, ordersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = ({ isOpen, onClose, onSelectPolicyForView, onOpenRefundModal }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('policies'); // 'policies' | 'orders'
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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Customer Portal</span>
            <h3 className="text-xl font-bold">{user.first_name ? `${user.first_name} ${user.last_name}` : user.email}</h3>
            <p className="text-xs text-slate-400">{user.email}</p>
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
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Issued Policies ({policies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading records...</div>
          ) : activeTab === 'policies' ? (
            policies.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">No policies issued yet.</p>
                <p className="text-xs text-slate-400">Calculate a quote on the homepage to purchase coverage.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {policies.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl border border-slate-200 hover:border-brand-300 transition-all bg-white shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{p.policy_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.status === 'ACTIVE' || p.status === 'ISSUED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-brand-600">
                        {p.destination_name} • {p.plan_name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span>Valid: {p.start_date} to {p.end_date}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectPolicyForView(p);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            orders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">No orders found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-slate-900">{ord.order_number}</span>
                      <span className="font-bold text-sm text-slate-900">€{ord.total} {ord.currency}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Status: <strong className="text-slate-800">{ord.status}</strong></span>
                      <span>{ord.travelers?.length || 1} Traveler(s)</span>
                    </div>
                    {ord.status === 'ISSUED' && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenRefundModal(ord.order_number);
                          }}
                          className="text-xs text-slate-500 hover:text-rose-600 underline"
                        >
                          Request Cancellation / Refund
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
