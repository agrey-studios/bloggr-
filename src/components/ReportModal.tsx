import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';

const REPORT_REASONS = [
  {
    id: 'misinformation',
    title: 'Misinformation or False News',
    desc: 'Inaccurate reporting, fabricated facts, or doctored material',
  },
  {
    id: 'clickbait',
    title: 'Misleading Headline (Clickbait)',
    desc: 'Headline grossly exaggerates or misrepresents article content',
  },
  {
    id: 'hate_speech',
    title: 'Hate Speech or Harassment',
    desc: 'Targeting, defaming, or threatening protected individuals or communities',
  },
  {
    id: 'spam',
    title: 'Spam or Commercial Promotion',
    desc: 'Excessive promotional solicitation, affiliate spam, or bot posting',
  },
  {
    id: 'plagiarism',
    title: 'Plagiarism or Copyright Infringement',
    desc: 'Stolen intellectual property without proper attribution',
  },
  {
    id: 'inappropriate',
    title: 'Graphic or Inappropriate Content',
    desc: 'Gratuitously violent, explicit, or disturbing material',
  },
  {
    id: 'other',
    title: 'Other Community Guideline Violation',
    desc: 'Issue not covered by the standard reporting categories above',
  },
];

export const ReportModal: React.FC = () => {
  const { reportModalPost, closeReportModal, submitReport } = useBloggr();
  const [selectedReason, setSelectedReason] = useState<string>('misinformation');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reportModalPost) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitReport(reportModalPost.id, selectedReason, details);
    } finally {
      setIsSubmitting(false);
      setDetails('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={closeReportModal}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">Report Article</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Help protect editorial integrity on Bloggr</p>
            </div>
          </div>

          <button
            onClick={closeReportModal}
            className="p-1.5 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Article Snippet */}
        <div className="px-5 py-3 bg-neutral-100/60 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
          <span className="font-semibold text-neutral-500 dark:text-neutral-400">Reporting: </span>
          <span className="font-bold text-neutral-900 dark:text-white">"{reportModalPost.title}"</span>
          <span className="text-neutral-400"> by u/{reportModalPost.author}</span>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Select a Reason
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map(reason => {
                const isSelected = selectedReason === reason.id;
                return (
                  <label
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-neutral-900 dark:text-white'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-0.5 accent-orange-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-tight">{reason.title}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{reason.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Provide any context, timestamps, or links to help our moderators review this report..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeReportModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 active:scale-98 text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
