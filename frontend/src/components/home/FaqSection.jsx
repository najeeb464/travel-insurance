import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      question: 'Is AeroSure insurance valid for Schengen visa applications?',
      answer: 'Yes! All AeroSure policies fully meet Regulation (EC) No 810/2009 of the European Parliament. They include €30,000+ medical cover, emergency medical evacuation, repatriation of mortal remains, and zero deductible across all 29 Schengen states.',
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
    <section id="faq" className="py-20 bg-white text-slate-900 relative overflow-hidden border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-[#00875A] text-xs font-bold font-sans">
            <HelpCircle className="w-3.5 h-3.5 text-[#00875A]" />
            <span>Help centre</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Questions, meet answers.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-sans">
            Everything worth knowing before you protect your journey.
          </p>
        </motion.div>

        <div className="space-y-4">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || idx}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? 'bg-white border-[#00875A] shadow-md' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-slate-900 text-sm sm:text-base transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#00875A]' : 'text-slate-400'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-sans">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Verification banner callout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-[#00875A] flex items-center justify-center flex-shrink-0 shadow-sm">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Need to verify a certificate issued by AeroSure?</h4>
              <p className="text-xs text-slate-600">Use our live public database tool to confirm status, coverage dates, and embassy status.</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenValidateModal}
            className="px-5 py-3 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex-shrink-0"
          >
            Open Live Verification Tool
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;
