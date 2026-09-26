import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Shield, 
  Info, 
  RotateCcw, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Globe, 
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { cmsApi } from '../../api';

// Supported pages metadata
const PAGE_TABS = [
  { slug: 'about-us', label: 'About Us', icon: Info },
  { slug: 'terms', label: 'Terms & Conditions', icon: FileText },
  { slug: 'privacy-policy', label: 'Privacy Policy', icon: Lock },
  { slug: 'refund-policy', label: 'Refund Policy', icon: RotateCcw },
];

// Normalize alias slugs
const normalizeSlug = (slug) => {
  if (!slug) return 'terms';
  const s = slug.toLowerCase().replace(/^#/, '');
  if (s === 'about' || s === 'aboutus' || s === 'about-us') return 'about-us';
  if (s === 'terms' || s === 'terms-and-conditions' || s === 'terms-of-service' || s === 'tos') return 'terms';
  if (s === 'privacy' || s === 'privacy-policy') return 'privacy-policy';
  if (s === 'refund' || s === 'refunds' || s === 'refund-policy') return 'refund-policy';
  return s;
};

// Rich fallback content if backend data is loading or minimal
const FALLBACK_PAGES = {
  'about-us': {
    title: 'About Tayara Travel Insurance',
    subtitle: 'Next-generation digital travel insurance accepted across 190+ countries worldwide.',
    updated_at: '2026-09-08T15:08:02.923Z',
    intro: 'Tayara Travel Insurance is an innovative travel insurance platform delivering instant digital insurance policies globally. Backed by top-tier international underwriters, our electronic certificates are officially validated and accepted by embassies, visa centres, and border authorities worldwide.',
    sections: [
      {
        heading: 'Our Mission & Vision',
        content: 'We believe travel protection should be instantaneous, transparent, and completely paperless. Gone are the days of printing endless forms or waiting days for underwriter approvals. With Tayara, travelers obtain compliant, embassy-recognized insurance in under 2 minutes.',
      },
      {
        heading: 'Schengen & Global Visa Compliance',
        content: 'All our international policies fully comply with Regulation (EC) No 810/2009 of the European Parliament. Every certificate comes with mandatory €30,000+ medical expense coverage, medical repatriation, zero deductible (€0 excess), and direct hospital direct-billing worldwide.',
      },
      {
        heading: 'Instant QR-Code Verification',
        content: 'Every policy certificate contains a cryptographic SHA-256 seal and a live QR code. Consulates, border control officers, and policyholders can verify policy validity on-demand using our public online validation engine.',
      },
      {
        heading: '24/7 Global Emergency Assistance',
        content: 'Our multilingual emergency assistance teams operate round the clock. Whether you require urgent hospital coordination, translation assistance, or emergency medical evacuation, help is always a phone call away.',
      },
    ],
    badges: ['190+ Countries Accepted', '€30,000 / $35,000+ Schengen Standard', '24/7 Human Support', 'Instant PDF Delivery'],
  },
  'terms': {
    title: 'Terms & Conditions of Insurance',
    subtitle: 'Comprehensive terms and conditions of travel insurance contract, policyholder obligations, and claims procedures.',
    updated_at: '2026-09-08T15:08:02.924Z',
    intro: 'Please review these Terms & Conditions carefully prior to purchasing a policy. By completing checkout, you enter into a legally binding insurance contract between yourself (and all insured travelers) and Tayara Insurance Underwriters.',
    sections: [
      {
        heading: '1. Eligibility & Scope of Coverage',
        content: 'Coverage is available to individuals of all nationalities traveling outside their home country of permanent residence. The policy takes effect from 00:00:00 UTC on the start date selected at booking and terminates at 23:59:59 UTC on the scheduled return date.',
      },
      {
        heading: '2. Insured Benefits & Deductibles',
        content: 'Medical expenses resulting from sudden acute illness or unforeseen accidents during the journey are covered up to the maximum policy benefit stated on your certificate (€30,000 / $35,000+ for Start, €50,000 / $55,000+ for Gold, and €100,000 / $110,000+ for Max+). All plans feature a $0 / €0 deductible (zero excess).',
      },
      {
        heading: '3. Pre-Existing Conditions & Exclusions',
        content: 'Standard emergency coverage excludes routine care, elective procedures, chronic pre-existing medical conditions (except acute sudden stabilization), self-inflicted injuries, and incidents occurring while engaged in non-disclosed extreme sports or high-risk professional athletics.',
      },
      {
        heading: '4. Claim Notification & Submission Deadline',
        content: 'In the event of medical emergencies, the assistance operations center must be notified immediately prior to admission when physically possible. All claims, hospital receipts, and supporting travel itineraries must be submitted within 30 calendar days of the loss date.',
      },
      {
        heading: '5. Policy Verification & Border Acceptance',
        content: 'Policy certificates are delivered electronically via email in PDF format. Every policy is registered on our public verification database and conforms with Schengen visa requirements under Regulation (EC) No 810/2009.',
      },
    ],
    badges: ['Zero Deductible', 'Schengen Compliant', '30-Day Claim Window', 'Electronic Certificate'],
  },
  'privacy-policy': {
    title: 'Privacy & Data Protection Policy',
    subtitle: 'How we collect, encrypt, store, and safeguard your personal and passport information in full compliance with GDPR.',
    updated_at: '2026-09-08T15:08:02.925Z',
    intro: 'At Tayara, protecting your personal information and travel data is foundational to our service. This Privacy Policy details our encryption protocols, data retention policies, and your individual rights under international privacy frameworks including GDPR.',
    sections: [
      {
        heading: '1. Information We Collect',
        content: 'When generating insurance quotes and policies, we collect necessary traveler identification: full name, date of birth, passport number, nationality, travel dates, contact email, and telephone number. Payment credentials are tokenized directly through certified PCI-DSS Level 1 payment processors.',
      },
      {
        heading: '2. How Your Data Is Utilized',
        content: 'Your personal data is strictly used to underwrite travel insurance contracts, generate embassy-compliant certificates, assist medical coordinators in emergencies, and comply with international anti-money laundering regulations.',
      },
      {
        heading: '3. Data Encryption & Security Standards',
        content: 'All communications between your device and our servers utilize 256-Bit TLS 1.3 encryption. Passwords and sensitive traveler information are salted and hashed using modern cryptographic algorithms.',
      },
      {
        heading: '4. Third-Party Sharing Restrictions',
        content: 'We do not sell, rent, or trade your personal information. Data is disclosed only to authorized international underwriters, medical assistance providers during an active emergency, or verified consular officials verifying visa documents.',
      },
      {
        heading: '5. Your GDPR Rights & Data Erasure',
        content: 'You retain the right to request access to your stored data, rectify any errors, or request erasure after mandatory statutory insurance record-retention periods have elapsed. For privacy inquiries, contact privacy@tayaratravelinsurance.com.',
      },
    ],
    badges: ['GDPR Compliant', '256-Bit TLS Encryption', 'PCI-DSS Tokenized', 'No Third-Party Ad Tracking'],
  },
  'refund-policy': {
    title: 'Policy Cancellation & Refund Policy',
    subtitle: 'Straightforward, transparent refund terms designed to give travelers total peace of mind.',
    updated_at: '2026-09-08T15:08:02.926Z',
    intro: 'We understand travel plans can change unexpectedly due to visa delays, flight cancellations, or personal emergencies. Our refund policy ensures you can cancel your policy easily and receive your funds back promptly.',
    sections: [
      {
        heading: '1. Cancellation Before Policy Effective Date',
        content: 'A 100% full refund is granted for any cancellation requested prior to 00:00:00 UTC on the start date of your insurance coverage. No penalty fees or administrative deductions are applied.',
      },
      {
        heading: '2. Visa Refusal Guarantee',
        content: 'If your Schengen or national visa application is rejected by the consulate, you are entitled to a full refund upon uploading the official embassy rejection letter, even if submitted up to 48 hours after the scheduled start date.',
      },
      {
        heading: '3. Cancellation After Effective Date',
        content: 'Once the insurance period has commenced and coverage has taken effect, policies cannot be refunded or cancelled, as underwriters have assumed the active travel risk for the selected itinerary.',
      },
      {
        heading: '4. Instant Refund Processing Window',
        content: 'Approved refunds are issued automatically back to your original payment method (Credit Card, Apple Pay, PayPal) within 3 to 5 business days, depending on your financial institution.',
      },
    ],
    badges: ['100% Full Refund Before Start', 'Visa Refusal Protection', '3-5 Day Bank Processing', 'Online Self-Service'],
  },
};

const PageModal = ({ isOpen, onClose, initialSlug = 'terms' }) => {
  const [activeSlug, setActiveSlug] = useState(() => normalizeSlug(initialSlug));
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync activeSlug whenever initialSlug changes
  useEffect(() => {
    if (initialSlug) {
      setActiveSlug(normalizeSlug(initialSlug));
    }
  }, [initialSlug]);

  // Fetch page content whenever activeSlug changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const currentSlug = normalizeSlug(activeSlug);

    cmsApi.getPage(currentSlug)
      .then((res) => {
        if (!isMounted) return;
        const data = res.data;
        if (data && data.title) {
          setPageData(data);
        } else {
          setPageData(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        // Not a blocking error; we have rich fallback content
        console.warn(`CMS API notice for page [${currentSlug}]:`, err.message || err);
        setPageData(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSlug, isOpen]);

  if (!isOpen) return null;

  const currentFallback = FALLBACK_PAGES[activeSlug] || FALLBACK_PAGES['terms'];
  const title = pageData?.title || currentFallback.title;
  const backendContent = pageData?.content || '';
  const updatedAt = pageData?.updated_at || currentFallback.updated_at;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900 flex flex-col max-h-[90vh]"
        >
          {/* Top Brand Header */}
          <div className="bg-[#002E21] text-white px-6 py-5 border-b border-emerald-900/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
                    Tayara Legal & Company
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800/60 text-emerald-200 border border-emerald-700/50">
                    Official Document
                  </span>
                </div>
                <h3 className="text-lg font-bold font-heading text-white">{title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 text-xs font-semibold hover:bg-emerald-800/80 hover:text-white transition-colors"
                title="Print this document"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Tab Selector */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {PAGE_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeSlug === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => setActiveSlug(tab.slug)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-[#00875A] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-6">
            {/* Title and subtitle */}
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  {title}
                </h1>
                {updatedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Updated {new Date(updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-600 font-sans leading-relaxed">
                {currentFallback.subtitle}
              </p>
            </div>

            {/* Badges row */}
            {currentFallback.badges && currentFallback.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {currentFallback.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#00875A] border border-emerald-200/80"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Backend Content Callout (if fetched from CMS model) */}
            {backendContent && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-200/60 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00875A] font-mono uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </div>
                <p>{backendContent}</p>
              </div>
            )}

            {/* Introductory Text (if not already covered by backend content) */}
            {!backendContent && currentFallback.intro && (
              <p className="text-sm text-slate-700 leading-relaxed font-sans font-medium">
                {currentFallback.intro}
              </p>
            )}

            {/* Structured Sections */}
            {currentFallback.sections && currentFallback.sections.length > 0 && (
              <div className="space-y-5 pt-2">
                {currentFallback.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2 shadow-xs"
                  >
                    <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-[#00875A] flex-shrink-0" />
                      <span>{section.heading}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pl-6">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Embassy & Underwriter Guarantee Callout */}
            <div className="p-5 rounded-2xl bg-[#002E21] text-emerald-100 border border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center text-emerald-300 flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Official Underwriter Verification</h4>
                  <p className="text-emerald-200/70 text-[11px]">
                    Valid for all Schengen Visas (EC 810/2009) & Worldwide Embassies.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-300">
                <span>Direct Underwriter Service 24/7</span>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 text-xs">
            <span className="text-slate-500 font-mono">
              Tayara Document ID: CMS-{activeSlug.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageModal;
