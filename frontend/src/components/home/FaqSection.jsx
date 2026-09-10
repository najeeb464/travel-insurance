import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, FileCheck } from 'lucide-react';
import { cmsApi } from '../../api';

const FaqSection = ({ onOpenValidateModal }) => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    cmsApi.getFaqs()
      .then((res) => {
        const list = res.data.results || res.data || [];
        if (list.length > 0) {
          setFaqs(list);
        }
      })
      .catch((err) => console.error('Failed to load FAQs:', err));
  }, []);

  const fallbackFaqs = [
    {
      id: 1,
      category_display: 'General Questions',
      question: 'Is EKTA insurance valid for Schengen visa applications?',
      answer: 'Yes! All EKTA policies fully meet Regulation (EC) No 810/2009 of the European Parliament. They include €30,000+ medical cover, emergency medical evacuation, repatriation of mortal remains, and zero deductible across all 29 Schengen states.',
    },
    {
      id: 2,
      category_display: 'Ordering & Payment',
      question: 'How quickly will I receive my insurance policy?',
      answer: 'Immediately after successful payment! The electronic insurance certificate and policy document are generated automatically and sent to your email within seconds. You can print it or show it directly on your smartphone.',
    },
    {
      id: 3,
      category_display: 'Policy & Documents',
      question: 'How can I or border control verify my policy authenticity?',
      answer: 'You or border control officers can verify any policy at any time using our public verification tool at /api/v1/policies/validate/{policy_number} or by scanning the QR code on your policy certificate.',
    },
    {
      id: 4,
      category_display: 'Insurance & Coverage',
      question: 'Does the policy cover COVID-19?',
      answer: 'Yes, all our plans (Start, Gold, Max+) cover diagnostic testing, outpatient doctor care, and inpatient hospitalization associated with acute COVID-19 infection.',
    },
    {
      id: 5,
      category_display: 'Refunds & Cancellations',
      question: 'Can I cancel my policy and get a refund if my trip is cancelled?',
      answer: 'Yes. You can request a full refund prior to the policy start date directly via our online refund request form.',
    },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : fallbackFaqs;

  return (
    <section id="faq" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Help Center
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to know about our coverage, embassy requirements, and claims.
          </p>
        </div>

        <div className="space-y-4">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-100/50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Verification banner callout */}
        <div className="mt-12 p-6 rounded-3xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-brand-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Need to check a certificate issued by EKTA?</h4>
              <p className="text-xs text-slate-600">Use our live public database tool to confirm status and authenticity.</p>
            </div>
          </div>
          <button
            onClick={onOpenValidateModal}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex-shrink-0"
          >
            Open Verification Tool
          </button>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
