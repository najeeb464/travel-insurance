import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RefreshCw,
  Users,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  BarChart3,
  Calendar,
  MapPin,
  Check,
  Ban,
  ShieldAlert,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';
import { adminApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardModal = ({ isOpen, onClose, onViewPolicy }) => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Refund action state
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundActionNotes, setRefundActionNotes] = useState('');
  const [refundProcessing, setRefundProcessing] = useState(false);
  const [refundActionSuccess, setRefundActionSuccess] = useState(null);

  // Selected Order Snapshot modal
  const [viewOrderSnapshot, setViewOrderSnapshot] = useState(null);

  const isStaffOrAdmin = Boolean(
    user && (user.is_staff || user.is_superuser || user.role === 'ADMIN' || user.role === 'STAFF')
  );

  const fetchStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await adminApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to fetch administrative statistics. Please verify staff permissions.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && isStaffOrAdmin) {
      fetchStats();
    }
  }, [isOpen, isStaffOrAdmin]);

  // Handle Approve / Reject refund
  const handleProcessRefund = async (action) => {
    if (!selectedRefund) return;
    setRefundProcessing(true);
    try {
      const res = await adminApi.actionRefund(selectedRefund.id, action, refundActionNotes);
      setRefundActionSuccess(res.data.message || `Refund ${action}ed successfully.`);

      // Update local state
      if (stats?.recent_refunds) {
        setStats((prev) => ({
          ...prev,
          recent_refunds: prev.recent_refunds.map((r) =>
            r.id === selectedRefund.id ? { ...r, status: action === 'approve' ? 'COMPLETED' : 'REJECTED' } : r
          ),
          overview: {
            ...prev.overview,
            pending_refunds_count: Math.max(0, prev.overview.pending_refunds_count - 1),
            total_refunded_amount:
              action === 'approve'
                ? prev.overview.total_refunded_amount + selectedRefund.requested_amount
                : prev.overview.total_refunded_amount,
          },
        }));
      }

      setTimeout(() => {
        setSelectedRefund(null);
        setRefundActionNotes('');
        setRefundActionSuccess(null);
      }, 1400);
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} refund.`);
    } finally {
      setRefundProcessing(false);
    }
  };

  // Filtered lists
  const filteredOrders = useMemo(() => {
    if (!stats?.recent_orders) return [];
    return stats.recent_orders.filter((ord) => {
      const matchesSearch =
        ord.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.contact_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.policy_number?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stats, searchQuery, statusFilter]);

  const filteredPolicies = useMemo(() => {
    if (!stats?.recent_policies) return [];
    return stats.recent_policies.filter((pol) => {
      const matchesSearch =
        pol.policy_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pol.destination_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pol.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pol.contact_email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || pol.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stats, searchQuery, statusFilter]);

  const filteredQuotes = useMemo(() => {
    if (!stats?.recent_quotes) return [];
    return stats.recent_quotes.filter((q) => {
      const matchesSearch =
        q.quote_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.destination_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.plan_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stats, searchQuery, statusFilter]);

  const filteredRefunds = useMemo(() => {
    if (!stats?.recent_refunds) return [];
    return stats.recent_refunds.filter((ref) => {
      const matchesSearch =
        ref.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.reason?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || ref.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stats, searchQuery, statusFilter]);

  const filteredCustomers = useMemo(() => {
    if (!stats?.recent_customers) return [];
    return stats.recent_customers.filter((c) => {
      return (
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [stats, searchQuery]);

  // Export to CSV utility
  const handleExportCSV = () => {
    let rows = [];
    let filename = `tayara_${activeTab}_report.csv`;

    if (activeTab === 'orders') {
      rows = [
        ['Order Number', 'Customer Name', 'Customer Email', 'Amount', 'Currency', 'Status', 'Policy Number', 'Date'],
        ...filteredOrders.map((o) => [
          o.order_number,
          `"${o.contact_full_name}"`,
          o.contact_email,
          o.total,
          o.currency,
          o.status,
          o.policy_number || 'None',
          o.created_at,
        ]),
      ];
    } else if (activeTab === 'policies') {
      rows = [
        ['Policy Number', 'Order Number', 'Insured Name', 'Destination', 'Plan', 'Start Date', 'End Date', 'Medical Limit', 'Status'],
        ...filteredPolicies.map((p) => [
          p.policy_number,
          p.order_number,
          `"${p.contact_name}"`,
          `"${p.destination_name}"`,
          p.plan_name,
          p.start_date,
          p.end_date,
          p.medical_limit,
          p.status,
        ]),
      ];
    } else if (activeTab === 'quotes') {
      rows = [
        ['Quote Number', 'Destination', 'Plan', 'Total', 'Currency', 'Status', 'Date'],
        ...filteredQuotes.map((q) => [
          q.quote_number,
          `"${q.destination_name}"`,
          q.plan_name,
          q.total,
          q.currency,
          q.status,
          q.created_at,
        ]),
      ];
    } else if (activeTab === 'refunds') {
      rows = [
        ['Refund ID', 'Order Number', 'Customer Email', 'Requested Amount', 'Currency', 'Status', 'Reason', 'Processed Date'],
        ...filteredRefunds.map((r) => [
          r.id,
          r.order_number,
          r.contact_email,
          r.requested_amount,
          r.currency,
          r.status,
          `"${(r.reason || '').replace(/"/g, '""')}"`,
          r.processed_at || 'Pending',
        ]),
      ];
    } else {
      // General overview summary export
      rows = [
        ['Metric', 'Value'],
        ['Total Customers', stats?.overview?.total_customers || 0],
        ['Total Issued Policies', stats?.overview?.total_policies || 0],
        ['Active Policies Today', stats?.overview?.active_policies || 0],
        ['Total Orders', stats?.overview?.total_orders || 0],
        ['Paid / Issued Orders', stats?.overview?.paid_or_issued_orders || 0],
        ['Total Quotes', stats?.overview?.total_quotes || 0],
        ['Converted Quotes', stats?.overview?.converted_quotes || 0],
        ['Quote Conversion Rate', `${stats?.overview?.quote_conversion_rate || 0}%`],
        ['Gross Revenue (€)', stats?.overview?.gross_revenue || 0],
        ['Average Order Value (€)', stats?.overview?.avg_order_value || 0],
        ['Total Refunds Count', stats?.overview?.total_refunds_count || 0],
        ['Pending Refunds Count', stats?.overview?.pending_refunds_count || 0],
        ['Total Refunded (€)', stats?.overview?.total_refunded_amount || 0],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ISSUED':
      case 'ACTIVE':
      case 'COMPLETED':
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PAID':
      case 'CONVERTED':
      case 'APPROVED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING_PAYMENT':
      case 'REQUESTED':
      case 'UNDER_REVIEW':
      case 'CALCULATED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
      case 'REJECTED':
      case 'EXPIRED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'REFUNDED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-7xl bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Header */}
          <div className="bg-[#002E21] text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
                <BarChart3 className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight font-heading text-white">Tayara Operations & Admin Center</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80">
                  Signed in as <span className="font-semibold text-white">{user?.email}</span> ({user?.role || 'Staff'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchStats(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/50 transition-all disabled:opacity-50"
                title="Refresh statistics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/50 transition-all"
                title="Download CSV Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-emerald-300/70 hover:text-white hover:bg-emerald-800/40 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Access Denied Guard */}
          {!isStaffOrAdmin ? (
            <div className="p-12 text-center bg-white flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
              <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
                You do not have administrative privileges to view system statistical metrics. Please sign in with an authorized staff account.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all"
              >
                Return to Site
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => fetchStats()}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* 6 Key Statistical KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Total Customers */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Customers</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00875A] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-heading">
                    {loading ? '—' : stats?.overview?.total_customers ?? 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Registered travelers</span>
                  </p>
                </div>

                {/* 2. Issued Policies */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Issued Policies</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-heading">
                    {loading ? '—' : stats?.overview?.total_policies ?? 0}
                  </div>
                  <p className="text-[11px] text-blue-600 mt-1 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>{stats?.overview?.active_policies ?? 0} Active today</span>
                  </p>
                </div>

                {/* 3. Total Orders */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-heading">
                    {loading ? '—' : stats?.overview?.total_orders ?? 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    <span className="font-bold text-slate-800">{stats?.overview?.paid_or_issued_orders ?? 0}</span> paid ({stats?.overview?.order_completion_rate ?? 0}%)
                  </p>
                </div>

                {/* 4. Quotations */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-amber-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quotations</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-heading">
                    {loading ? '—' : stats?.overview?.total_quotes ?? 0}
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1 font-semibold">
                    {stats?.overview?.quote_conversion_rate ?? 0}% Converted
                  </p>
                </div>

                {/* 5. Gross Revenue */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Revenue</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 font-heading truncate">
                    {loading ? '—' : `€${stats?.overview?.gross_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    AOV: <span className="font-semibold text-slate-700">€{stats?.overview?.avg_order_value ?? '0.00'}</span>
                  </p>
                </div>

                {/* 6. Refunds */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-rose-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Refunds</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-heading">
                    {loading ? '—' : stats?.overview?.total_refunds_count ?? 0}
                  </div>
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                    {stats?.overview?.pending_refunds_count ?? 0} Pending Review
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {[
                    { id: 'analytics', label: 'Overview & Analytics', icon: BarChart3 },
                    { id: 'orders', label: `Orders (${stats?.overview?.total_orders ?? 0})`, icon: ShoppingBag },
                    { id: 'policies', label: `Issued Policies (${stats?.overview?.total_policies ?? 0})`, icon: ShieldCheck },
                    { id: 'quotes', label: `Quotations (${stats?.overview?.total_quotes ?? 0})`, icon: FileText },
                    { id: 'refunds', label: `Refunds (${stats?.overview?.total_refunds_count ?? 0})`, icon: RotateCcw, badge: stats?.overview?.pending_refunds_count },
                    { id: 'customers', label: `Customers (${stats?.overview?.total_customers ?? 0})`, icon: Users },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setStatusFilter('ALL');
                          setSearchQuery('');
                        }}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          isActive
                            ? 'bg-[#00875A] text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        {tab.badge > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Search input (for tabular views) */}
                {activeTab !== 'analytics' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab}...`}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TAB 1: Analytics & Breakdown Charts */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Status Breakdown */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-heading">
                          Orders Status Breakdown
                        </h3>
                        <span className="text-xs font-bold text-slate-500">
                          {stats?.overview?.total_orders ?? 0} Total Orders
                        </span>
                      </div>

                      {/* Segmented bar */}
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        {stats?.order_breakdown && (
                          <>
                            <div
                              style={{ width: `${((stats.order_breakdown.ISSUED || 0) / (stats.overview?.total_orders || 1)) * 100}%` }}
                              className="bg-emerald-500 h-full transition-all"
                              title={`Issued: ${stats.order_breakdown.ISSUED || 0}`}
                            />
                            <div
                              style={{ width: `${((stats.order_breakdown.PAID || 0) / (stats.overview?.total_orders || 1)) * 100}%` }}
                              className="bg-blue-500 h-full transition-all"
                              title={`Paid: ${stats.order_breakdown.PAID || 0}`}
                            />
                            <div
                              style={{ width: `${((stats.order_breakdown.PENDING_PAYMENT || 0) / (stats.overview?.total_orders || 1)) * 100}%` }}
                              className="bg-amber-400 h-full transition-all"
                              title={`Pending: ${stats.order_breakdown.PENDING_PAYMENT || 0}`}
                            />
                            <div
                              style={{ width: `${((stats.order_breakdown.CANCELLED || 0) / (stats.overview?.total_orders || 1)) * 100}%` }}
                              className="bg-slate-300 h-full transition-all"
                              title={`Cancelled: ${stats.order_breakdown.CANCELLED || 0}`}
                            />
                            <div
                              style={{ width: `${((stats.order_breakdown.REFUNDED || 0) / (stats.overview?.total_orders || 1)) * 100}%` }}
                              className="bg-rose-400 h-full transition-all"
                              title={`Refunded: ${stats.order_breakdown.REFUNDED || 0}`}
                            />
                          </>
                        )}
                      </div>

                      {/* Distribution Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                        {[
                          { key: 'ISSUED', label: 'Policy Issued', color: 'bg-emerald-500', count: stats?.order_breakdown?.ISSUED || 0 },
                          { key: 'PAID', label: 'Paid & Processing', color: 'bg-blue-500', count: stats?.order_breakdown?.PAID || 0 },
                          { key: 'PENDING_PAYMENT', label: 'Pending Payment', color: 'bg-amber-400', count: stats?.order_breakdown?.PENDING_PAYMENT || 0 },
                          { key: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-400', count: stats?.order_breakdown?.CANCELLED || 0 },
                          { key: 'REFUNDED', label: 'Refunded', color: 'bg-rose-500', count: stats?.order_breakdown?.REFUNDED || 0 },
                          { key: 'FAILED', label: 'Failed', color: 'bg-rose-700', count: stats?.order_breakdown?.FAILED || 0 },
                        ].map((s) => (
                          <div key={s.key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                              <span className="text-xs font-semibold text-slate-700">{s.label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Destinations Breakdown */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-heading">
                          Top Covered Destinations
                        </h3>
                        <span className="text-xs font-bold text-slate-500">By Policies Issued</span>
                      </div>

                      {stats?.destinations_breakdown?.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">No destination policies issued yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {stats?.destinations_breakdown?.map((dest, idx) => {
                            const maxVal = Math.max(...(stats.destinations_breakdown.map((d) => d.count) || [1]));
                            const pct = Math.round((dest.count / maxVal) * 100);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="text-slate-800 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-[#00875A]" />
                                    <span>{dest.destination}</span>
                                  </span>
                                  <span className="text-slate-600">{dest.count} policies</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-[#00875A] rounded-full transition-all"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plan Tiers Breakdown */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-heading">
                        Insurance Plan Popularity
                      </h3>
                      {stats?.plans_breakdown?.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No plan breakdown data yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {stats?.plans_breakdown?.map((plan, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#00875A] flex items-center justify-center font-bold text-xs">
                                  #{idx + 1}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{plan.plan}</div>
                                  <div className="text-[10px] text-slate-500">Tier coverage</div>
                                </div>
                              </div>
                              <span className="text-xs font-black text-[#00875A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                {plan.count} policies
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Payment Providers Breakdown */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-heading">
                        Payment Gateway Activity
                      </h3>
                      {stats?.payment_breakdown?.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No payment transactions recorded yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {stats?.payment_breakdown?.map((pm, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{pm.provider}</div>
                                  <div className="text-[10px] text-slate-500">{pm.count} transactions</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-black text-slate-900">
                                  €{pm.volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-[10px] text-emerald-600 font-semibold">Processed</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Orders Ledger */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" /> Status:
                    </span>
                    {['ALL', 'ISSUED', 'PAID', 'PENDING_PAYMENT', 'CANCELLED', 'REFUNDED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          statusFilter === st
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                          <tr>
                            <th className="py-3 px-4">Order #</th>
                            <th className="py-3 px-4">Customer Contact</th>
                            <th className="py-3 px-4">Total</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Policy #</th>
                            <th className="py-3 px-4">Created Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-slate-400">
                                No orders matching the current filter.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.order_number}</td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-slate-900">{ord.contact_full_name}</div>
                                  <div className="text-[11px] text-slate-500">{ord.contact_email}</div>
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {ord.total} {ord.currency}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {ord.policy_number ? (
                                    <button
                                      onClick={() => onViewPolicy && onViewPolicy(ord.policy_number)}
                                      className="inline-flex items-center gap-1 font-mono font-bold text-[#00875A] hover:underline"
                                    >
                                      <span>{ord.policy_number}</span>
                                      <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">Unissued</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-500 text-[11px]">
                                  {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Issued Policies */}
              {activeTab === 'policies' && (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                          <tr>
                            <th className="py-3 px-4">Policy #</th>
                            <th className="py-3 px-4">Insured Traveler</th>
                            <th className="py-3 px-4">Destination & Plan</th>
                            <th className="py-3 px-4">Coverage Period</th>
                            <th className="py-3 px-4">Limit</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredPolicies.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-8 text-center text-slate-400">
                                No policies matching current query.
                              </td>
                            </tr>
                          ) : (
                            filteredPolicies.map((pol) => (
                              <tr key={pol.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-[#00875A]">
                                  {pol.policy_number}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-slate-900">{pol.contact_name}</div>
                                  <div className="text-[11px] text-slate-500">{pol.contact_email}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-slate-900">{pol.destination_name}</div>
                                  <div className="text-[11px] text-slate-500">{pol.plan_name}</div>
                                </td>
                                <td className="py-3 px-4 text-slate-600 font-medium">
                                  {pol.start_date} → {pol.end_date}
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-800">
                                  {pol.medical_limit}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(pol.status)}`}>
                                    {pol.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => onViewPolicy && onViewPolicy(pol.policy_number)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-[#00875A] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Inspect Certificate</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Quotations */}
              {activeTab === 'quotes' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" /> Status:
                    </span>
                    {['ALL', 'CALCULATED', 'CONVERTED', 'EXPIRED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          statusFilter === st
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                          <tr>
                            <th className="py-3 px-4">Quote #</th>
                            <th className="py-3 px-4">Destination</th>
                            <th className="py-3 px-4">Plan Tier</th>
                            <th className="py-3 px-4">Total Quote</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Calculated Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredQuotes.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-slate-400">
                                No quotations found.
                              </td>
                            </tr>
                          ) : (
                            filteredQuotes.map((q) => (
                              <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{q.quote_number}</td>
                                <td className="py-3 px-4 font-semibold text-slate-900">{q.destination_name}</td>
                                <td className="py-3 px-4 text-slate-600">{q.plan_name}</td>
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {q.total} {q.currency}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(q.status)}`}>
                                    {q.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-500 text-[11px]">
                                  {new Date(q.created_at).toLocaleDateString()} {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Refund Requests & Actions */}
              {activeTab === 'refunds' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" /> Status:
                    </span>
                    {['ALL', 'REQUESTED', 'COMPLETED', 'REJECTED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          statusFilter === st
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                          <tr>
                            <th className="py-3 px-4">Order #</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Refund Amount</th>
                            <th className="py-3 px-4">Reason</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Admin Notes</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredRefunds.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-8 text-center text-slate-400">
                                No refund requests recorded.
                              </td>
                            </tr>
                          ) : (
                            filteredRefunds.map((ref) => (
                              <tr key={ref.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{ref.order_number}</td>
                                <td className="py-3 px-4 text-slate-700 font-medium">{ref.contact_email}</td>
                                <td className="py-3 px-4 font-black text-rose-700">
                                  {ref.requested_amount} {ref.currency}
                                </td>
                                <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={ref.reason}>
                                  {ref.reason}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(ref.status)}`}>
                                    {ref.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-[11px] text-slate-500 italic max-w-xs truncate">
                                  {ref.admin_notes || '—'}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {ref.status === 'REQUESTED' || ref.status === 'UNDER_REVIEW' ? (
                                    <button
                                      onClick={() => {
                                        setSelectedRefund(ref);
                                        setRefundActionNotes('');
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
                                    >
                                      <span>Review Request</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-medium">Processed</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Customers */}
              {activeTab === 'customers' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                        <tr>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Total Orders</th>
                          <th className="py-3 px-4">Date Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400">
                              No customer accounts found.
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 font-semibold text-slate-900">{c.email}</td>
                              <td className="py-3 px-4 text-slate-700">
                                {c.first_name || c.last_name ? `${c.first_name} ${c.last_name}` : c.username}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  c.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {c.role}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">{c.orders_count}</td>
                              <td className="py-3 px-4 text-slate-500 text-[11px]">
                                {new Date(c.date_joined).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Refund Review & Action Modal Dialog */}
          <AnimatePresence>
            {selectedRefund && (
              <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-slate-900 font-heading font-black">
                      <RotateCcw className="w-5 h-5 text-rose-600" />
                      <span>Review Refund Request</span>
                    </div>
                    <button
                      onClick={() => setSelectedRefund(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {refundActionSuccess ? (
                    <div className="py-6 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-900">{refundActionSuccess}</div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Order:</span>
                          <span className="font-mono font-bold text-slate-900">{selectedRefund.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Customer:</span>
                          <span className="font-medium text-slate-800">{selectedRefund.contact_email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Refund Amount:</span>
                          <span className="font-black text-rose-600 text-sm">
                            {selectedRefund.requested_amount} {selectedRefund.currency}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 font-semibold">Customer's Stated Reason:</span>
                        <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-slate-700 italic">
                          "{selectedRefund.reason}"
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-700 font-bold block">
                          Internal Admin Notes / Settlement Reference:
                        </label>
                        <textarea
                          rows="2"
                          value={refundActionNotes}
                          onChange={(e) => setRefundActionNotes(e.target.value)}
                          placeholder="e.g., Cancellation approved as per terms within 14 days"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleProcessRefund('reject')}
                          disabled={refundProcessing}
                          className="flex-1 py-2.5 rounded-xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all text-xs disabled:opacity-50"
                        >
                          Reject Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProcessRefund('approve')}
                          disabled={refundProcessing}
                          className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all text-xs disabled:opacity-50"
                        >
                          {refundProcessing ? 'Processing...' : 'Approve & Settle Refund'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminDashboardModal;
