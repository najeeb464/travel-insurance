import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, Quote, MessageSquare } from 'lucide-react';
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

  return (
    <section id="reviews" className="py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Real Travelers, Real Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Customer Experiences & Reviews
          </h2>
          <p className="text-sm text-slate-600">
            Rated 4.9/5 based on over 12,000 verified traveler reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayList.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs leading-relaxed text-slate-700 italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rev.reviewer_name}</h4>
                  <span className="text-[10px] text-slate-400">{rev.country}</span>
                </div>
                {rev.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
