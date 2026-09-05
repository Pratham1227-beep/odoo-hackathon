import React from 'react';
import { Star, Plus, Award } from 'lucide-react';

export default function InternReviews({ reviews = [], onCreateReview, conversionStatus }) {
  const midTerm = reviews.find((r) => r.review_type === 'MID_TERM');
  const finalRev = reviews.find((r) => r.review_type === 'FINAL');

  const renderStars = (rating) => {
    const full = Math.round(rating);
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${s <= full ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
          />
        ))}
        <span className="ml-1 text-sm font-bold text-slate-900 dark:text-white">{rating} / 5</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Performance Reviews</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Mid-term and final internship evaluation</p>
        </div>
        <button
          onClick={onCreateReview}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mid-Term Card */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Mid-Term Review
            </span>
            {midTerm && <span className="text-xs text-slate-400">{new Date(midTerm.created_at).toLocaleDateString()}</span>}
          </div>

          {midTerm ? (
            <div className="space-y-3">
              {renderStars(midTerm.overall_rating)}
              {midTerm.feedback && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  "{midTerm.feedback}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">Mid-term review not recorded yet.</p>
          )}
        </div>

        {/* Final Review Card */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Final Internship Review
            </span>
            {finalRev && <span className="text-xs text-slate-400">{new Date(finalRev.created_at).toLocaleDateString()}</span>}
          </div>

          {finalRev ? (
            <div className="space-y-3">
              {renderStars(finalRev.overall_rating)}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div>Tech Skills: <b>{finalRev.technical_skills}/5</b></div>
                <div>Communication: <b>{finalRev.communication}/5</b></div>
                <div>Problem Solving: <b>{finalRev.problem_solving}/5</b></div>
                <div>Teamwork: <b>{finalRev.teamwork}/5</b></div>
              </div>
              {finalRev.feedback && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  "{finalRev.feedback}"
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-slate-400 mb-2">Final Review Pending</p>
              <button
                onClick={onCreateReview}
                className="px-3 py-1.5 bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 text-xs font-semibold rounded-lg hover:bg-purple-100 cursor-pointer"
              >
                Create Final Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
