import React from 'react';
import { Plane, Shield, Phone, Lock, ArrowRight } from 'lucide-react';

const Footer = ({ onOpenValidateModal, onOpenRefundModal, onOpenPage }) => {
  return (
    <footer className="bg-[#002E21] text-emerald-100/70 border-t border-emerald-900/60 print:hidden">
      {/* Upper reassurance banner */}
      <div className="border-b border-emerald-900/60 bg-[#00251a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Accepted Worldwide</h4>
                <p className="text-xs text-emerald-200/70">Meets visa and border entry criteria across 190+ countries.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">24/7 Human Assistance</h4>
                <p className="text-xs text-emerald-200/70">Multilingual travel coordinators ready at any hour.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Covered in 2 Minutes</h4>
                <p className="text-xs text-emerald-200/70">Digital policy certificate sent straight to your email.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white shadow-md">
                <Plane className="w-5 h-5 stroke-[2.4] -rotate-45" />
              </div>
              <span className="text-2xl font-black font-heading tracking-tight text-white">Tavara</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-200/80 max-w-sm font-sans">
              Digital travel protection built for people who want to spend less time on paperwork and more time going places.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenValidateModal}
                className="text-xs font-mono font-semibold text-emerald-300 hover:text-white underline underline-offset-4 flex items-center gap-1.5"
              >
                <span>Verify policy certificate online</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h5 className="text-xs font-mono font-bold text-white tracking-widest uppercase mb-4">Explore</h5>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPage && onOpenPage('about-us')}
                  className="hover:text-white text-left transition-colors"
                >
                  About Us
                </button>
              </li>
              <li><a href="#coverage" className="hover:text-white transition-colors">Coverage</a></li>
              <li><a href="#how" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Traveller stories</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Common questions</a></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h5 className="text-xs font-mono font-bold text-white tracking-widest uppercase mb-4">Support</h5>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <button onClick={onOpenValidateModal} className="hover:text-white text-left transition-colors">
                  Verify Policy
                </button>
              </li>
              <li>
                <button onClick={onOpenRefundModal} className="hover:text-white text-left transition-colors">
                  Request Refund
                </button>
              </li>
              <li><a href="mailto:help@tavara.example" className="text-emerald-300 hover:underline">help@tavara.example</a></li>
            </ul>
          </div>

          {/* Column 4: Accepted Payments */}
          <div>
            <h5 className="text-xs font-mono font-bold text-white tracking-widest uppercase mb-4">Accepted Payments</h5>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono font-bold text-emerald-100">
              <div className="p-2 bg-[#003828] rounded-xl border border-emerald-800/80">Visa</div>
              <div className="p-2 bg-[#003828] rounded-xl border border-emerald-800/80">Mastercard</div>
              <div className="p-2 bg-[#003828] rounded-xl border border-emerald-800/80">Apple Pay</div>
              <div className="p-2 bg-[#003828] rounded-xl border border-emerald-800/80">PayPal</div>
            </div>
            <p className="text-[11px] text-emerald-300/70 mt-3 font-mono">
              256-Bit SSL Encrypted Financial Checkout.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70 font-sans">
          <p>© {new Date().getFullYear()} Tavara Travel Insurance — Travel Insurance in Minutes. All rights reserved.</p>
          <div className="flex flex-wrap gap-5 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => onOpenPage && onOpenPage('about-us')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => onOpenPage && onOpenPage('terms')}
              className="hover:text-white transition-colors"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => onOpenPage && onOpenPage('privacy-policy')}
              className="hover:text-white transition-colors"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => onOpenPage && onOpenPage('refund-policy')}
              className="hover:text-white transition-colors"
            >
              Refunds
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
