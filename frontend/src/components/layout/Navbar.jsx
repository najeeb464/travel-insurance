import React, { useState } from 'react';
import { Shield, Plane, CheckCircle2, User, LogOut, FileText, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

const Navbar = ({ onOpenValidateModal, onOpenAuthModal, onOpenDashboard }) => {
  const { user, logout } = useAuth();
  const { resetBooking } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            onClick={resetBooking}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">EKTA</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                  TRAVELING
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Online Travel Insurance</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#quote-section" 
              onClick={resetBooking}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Insurance Products
            </a>
            <a 
              href="#why-us" 
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Why Choose Us
            </a>
            <a 
              href="#reviews" 
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Reviews
            </a>
            <a 
              href="#faq" 
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Validate Insurance Public Tool Button */}
            <button
              onClick={onOpenValidateModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-sm"
              title="Validate any issued policy number"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Validate Insurance</span>
            </button>

            {/* Currency Badge */}
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
              EUR (€)
            </div>

            {/* Account / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDashboard}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>My Policies</span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-md shadow-brand-500/20"
              >
                <User className="w-4 h-4" />
                <span>Client Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenValidateModal}
              className="p-2 text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200"
              title="Validate Insurance"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-brand-600 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-3">
          <a
            href="#quote-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-800 py-2"
          >
            Calculate Insurance
          </a>
          <a
            href="#why-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-800 py-2"
          >
            Why Choose Us
          </a>
          <a
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-800 py-2"
          >
            Customer Reviews
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-800 py-2"
          >
            Frequently Asked Questions
          </a>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenValidateModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validate Insurance Certificate</span>
            </button>

            {user ? (
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
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 text-center"
              >
                Client Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
