import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';

export default function CreateReviewModal({ isOpen, onClose, onSave }) {
  const [reviewType, setReviewType] = useState('FINAL');
  const [technicalSkills, setTechnicalSkills] = useState(4.5);
  const [communication, setCommunication] = useState(4.0);
  const [problemSolving, setProblemSolving] = useState(5.0);
  const [teamwork, setTeamwork] = useState(4.5);
  const [learningAbility, setLearningAbility] = useState(5.0);
  const [feedback, setFeedback] = useState('Excellent learning ability and strong ownership during internship.');
  const [recommendConversion, setRecommendConversion] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSave({
        review_type: reviewType,
        technical_skills: Number(technicalSkills),
        communication: Number(communication),
        problem_solving: Number(problemSolving),
        teamwork: Number(teamwork),
        learning_ability: Number(learningAbility),
        feedback,
        recommend_conversion: recommendConversion,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Performance Review</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Review Type</label>
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="MID_TERM">Mid-Term Review</option>
              <option value="FINAL">Final Internship Review</option>
            </select>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Technical Skills', val: technicalSkills, set: setTechnicalSkills },
              { label: 'Communication', val: communication, set: setCommunication },
              { label: 'Problem Solving', val: problemSolving, set: setProblemSolving },
              { label: 'Teamwork', val: teamwork, set: setTeamwork },
              { label: 'Learning Ability', val: learningAbility, set: setLearningAbility },
            ].map((ratingItem, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{ratingItem.label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={ratingItem.val}
                    onChange={(e) => ratingItem.set(e.target.value)}
                    className="w-24 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold w-6 text-right text-slate-900 dark:text-white">
                    {ratingItem.val}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Feedback & Comments</label>
            <textarea
              rows="3"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
              placeholder="Provide detailed qualitative evaluation..."
            />
          </div>

          {reviewType === 'FINAL' && (
            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recommendConversion}
                onChange={(e) => setRecommendConversion(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Recommend for Full-Time Conversion
              </span>
            </label>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
