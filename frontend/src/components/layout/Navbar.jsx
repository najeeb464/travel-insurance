import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, CheckCircle2, User, LogOut, FileText, Menu, X, ArrowRight, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

const Navbar = ({ onOpenValidateModal, onOpenAuthModal, onOpenDashboard, onOpenPage, onOpenAdminDashboard }) => {
  const { user, logout } = useAuth();
  const { resetBooking } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
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
