import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, CheckCircle2, User, LogOut, FileText, Menu, X, ArrowRight, BarChart3, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useCurrency } from '../../context/CurrencyContext';

const Navbar = ({ onOpenValidateModal, onOpenAuthModal, onOpenDashboard, onOpenPage, onOpenAdminDashboard }) => {
  const { user, logout } = useAuth();
  const { resetBooking } = useBooking();
  const { selectedCurrency, setSelectedCurrency, supportedCurrencies } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const isStaffOrAdmin = Boolean(
    user && (user.is_staff || user.is_superuser || user.role === 'ADMIN' || user.role === 'STAFF')
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 text-slate-900 shadow-sm transition-all print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Tayara Brand Logo */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetBooking}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-[#00734c] transition-all">
              <Plane className="w-5 h-5 stroke-[2.4] -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-black tracking-tight font-heading text-slate-900">Tayara</span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold mt-0.5">TRAVEL INSURANCE</p>
            </div>
          </motion.div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-sans text-xs font-bold text-slate-600 tracking-wide">
            <button
              type="button"
              onClick={() => onOpenPage && onOpenPage('about-us')}
              className="hover:text-[#00875A] transition-colors"
            >
              About Us
            </button>
            <a 
              href="#coverage" 
              className="hover:text-[#00875A] transition-colors"
            >
              Coverage
            </a>
            <a 
              href="#how" 
              className="hover:text-[#00875A] transition-colors"
            >
              How it works
            </a>
            <a 
              href="#reviews" 
              className="hover:text-[#00875A] transition-colors"
            >
              Reviews
            </a>
            <a 
              href="#faq" 
              className="hover:text-[#00875A] transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Currency Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer"
                title="Select preferred display currency"
              >
                <span>{supportedCurrencies[selectedCurrency]?.flag || '💵'}</span>
                <span>USD</span>
                {selectedCurrency !== 'USD' && (
                  <span className="text-[10px] font-mono text-[#00875A] bg-emerald-100/80 px-1 py-0.5 rounded font-bold">
                    ≈ {selectedCurrency}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {currencyDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setCurrencyDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-100 flex items-center justify-between">
                      <span>Checkout: USD ($)</span>
                      <span className="text-emerald-600">Live Preview</span>
                    </div>
                    {Object.values(supportedCurrencies).map((curr) => (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => {
                          setSelectedCurrency(curr.code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                          selectedCurrency === curr.code ? 'font-bold text-[#00875A] bg-emerald-50/70' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{curr.flag}</span>
                          <span>{curr.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 font-bold">{curr.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Verify Policy Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenValidateModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#00875A] bg-emerald-50 border border-emerald-600/30 hover:bg-emerald-100 transition-all"
              title="Validate any issued policy certificate"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00875A]" />
              <span>Verify policy</span>
            </motion.button>

            {/* Account / Sign In */}
            {user ? (
              <div className="flex items-center gap-2">
                {isStaffOrAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenAdminDashboard}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
                    title="Open Administrative Statistics & Operations Center"
                  >
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Admin Portal</span>
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onOpenDashboard}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#00875A] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
                >
                  <FileText className="w-4 h-4 text-[#00875A]" />
                  <span>My Policies</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00875A] hover:bg-[#00734c] shadow-md shadow-emerald-700/20 transition-all"
              >
                <User className="w-4 h-4 text-white" />
                <span>Sign In</span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenValidateModal}
              className="p-2 text-[#00875A] bg-emerald-50 rounded-xl border border-emerald-200"
              title="Validate Insurance"
            >
              <CheckCircle2 className="w-5 h-5 text-[#00875A]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-[#00875A] rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-3 overflow-hidden text-slate-800"
          >
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPage && onOpenPage('about-us');
              }}
              className="block w-full text-left text-sm font-semibold text-slate-700 py-2 hover:text-[#00875A]"
            >
              About Us
            </button>
            <a
              href="#coverage"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-2 hover:text-[#00875A]"
            >
              Coverage
            </a>
            <a
              href="#how"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-2 hover:text-[#00875A]"
            >
              How it works
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-2 hover:text-[#00875A]"
            >
              Reviews
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-2 hover:text-[#00875A]"
            >
              FAQ
            </a>

            {/* Mobile Currency Selector */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5 flex items-center justify-between">
                <span>Display Currency (Billed in USD)</span>
                <span className="text-[#00875A] font-bold">{selectedCurrency}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.values(supportedCurrencies).map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setSelectedCurrency(curr.code)}
                    className={`py-1 px-1 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 ${
                      selectedCurrency === curr.code
                        ? 'bg-[#00875A] text-white border-[#00875A]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{curr.flag}</span>
                    <span className="text-[10px]">{curr.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenValidateModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-[#00875A] bg-emerald-50 border border-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Policy Authenticity</span>
              </button>

              {user ? (
                <div className="space-y-2">
                  {isStaffOrAdmin && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAdminDashboard();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900"
                    >
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDashboard();
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100"
                    >
                      My Policies
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#00875A] text-center"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
