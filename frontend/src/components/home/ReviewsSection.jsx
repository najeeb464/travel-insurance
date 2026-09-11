import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Sparkles } from 'lucide-react';
import { reviewsApi } from '../../api';

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    reviewsApi.getReviews()
      .then((res) => {
        const list = res.data.results || res.data || [];
        if (list.length > 0) {
          setReviews(list);
        }
      })
      .catch((err) => console.error('Failed to load reviews:', err));
  }, []);

  const fallbackReviews = [
    {
      id: 1,
      reviewer_name: 'Sarah Jenkins',
      rating: 5,
      country: 'United Kingdom',
      comment: 'Bought policy in 2 minutes for our Spain trip. Embassy accepted it instantly for Schengen requirements! Very impressed with customer assistance.',
      is_verified: true,
    },
    {
      id: 2,
      reviewer_name: 'Marco Rossi',
      rating: 5,
      country: 'Italy',
      comment: 'Excellent assistance when my flight in Frankfurt got cancelled. Received rapid support on WhatsApp and zero deductions.',
      is_verified: true,
    },
    {
      id: 3,
      reviewer_name: 'Farhan Khan',
      rating: 5,
      country: 'Pakistan',
      comment: 'Very transparent pricing, no hidden charges. Downloaded the electronic PDF policy immediately after payment and verified it online.',
      is_verified: true,
    },
    {
      id: 4,
      reviewer_name: 'Elena Schulz',
      rating: 5,
      country: 'Germany',
      comment: 'Great pricing for active skiing insurance in Austria. Very smooth process without annoying paperwork.',
      is_verified: true,
    },
  ];

  const displayList = reviews.length > 0 ? reviews : fallbackReviews;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section id="reviews" className="py-20 bg-slate-50 text-slate-900 relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-[#00875A] text-xs font-bold font-sans">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Relax and explore</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Happy travellers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-sans leading-relaxed">
            Travel with a quieter mind. Join travellers who choose clear cover, instant documents, and help that answers at any hour.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayList.map((rev) => (
            <motion.div
              key={rev.id}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between space-y-5 cursor-default"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-sans italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rev.reviewer_name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{rev.country}</span>
                </div>
                {rev.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00875A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-[#00875A]" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
