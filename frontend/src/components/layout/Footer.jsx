import React from 'react';
import { Shield, Phone, Mail, MessageSquare, Lock, Globe, ExternalLink } from 'lucide-react';

const Footer = ({ onOpenValidateModal, onOpenRefundModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      {/* Upper reassurance banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">100% Schengen Accredited</h4>
                <p className="text-xs text-slate-400">Strictly satisfies Regulation (EC) No 810/2009 across all EU states.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">24/7 Worldwide Assistance</h4>
                <p className="text-xs text-slate-400">+380 44 590 55 55 / +44 20 7946 0192</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Instant Delivery & 256-Bit SSL</h4>
                <p className="text-xs text-slate-400">Issued electronically in under 2 minutes directly to your inbox.</p>
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
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">EKTA TRAVELING</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              EKTA is an authorized international digital travel insurance technology provider. 
              Our electronic policies are legally recognized by visa centers, embassies, and border control services globally.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenValidateModal}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 flex items-center gap-1.5"
              >
                Verify an existing insurance certificate online →
              </button>
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h5 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">Insurance Products</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#quote-section" className="hover:text-white transition-colors">Worldwide Travel Insurance</a></li>
              <li><a href="#quote-section" className="hover:text-white transition-colors">Schengen Visa Insurance</a></li>
              <li><a href="#quote-section" className="hover:text-white transition-colors">Extreme Sports & Ski Cover</a></li>
              <li><a href="#quote-section" className="hover:text-white transition-colors">COVID-19 Health Protection</a></li>
              <li><a href="#quote-section" className="hover:text-white transition-colors">Annual Multi-Trip Cover</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h5 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">Support & Services</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenValidateModal} className="hover:text-white text-left transition-colors">
                  Validate Insurance
                </button>
              </li>
              <li>
                <button onClick={onOpenRefundModal} className="hover:text-white text-left transition-colors">
                  Request Policy Refund
                </button>
              </li>
              <li><a href="#faq" className="hover:text-white transition-colors">Emergency Claims Guide</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked Questions</a></li>
              <li><span className="text-slate-500">support@ektatraveling.com</span></li>
            </ul>
          </div>

          {/* Column 4: Payment Methods */}
          <div>
            <h5 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">Accepted Payments</h5>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-slate-300">
              <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">Visa</div>
              <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">Mastercard</div>
              <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">Apple Pay</div>
              <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">PayPal</div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              All transactions encrypted via TLS 1.3 with 3D Secure 2.0 authorization.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EKTA Traveling. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-slate-400">Terms of Service</a>
            <a href="#privacy" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#refund" onClick={onOpenRefundModal} className="hover:text-slate-400">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
