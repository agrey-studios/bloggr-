import React, { useState } from 'react';
import { X, Award, Sparkles, Coins, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { AwardType, AUTHOR_SHARE_RATIO, ADMIN_SHARE_RATIO } from '../types';
import { AwardFaIcon } from './FontAwesomeIcon';

interface AwardItem {
  type: AwardType;
  name: string;
  emoji: string;
  kshAmount: number;
  description: string;
  perk: string;
}

const AWARDS: AwardItem[] = [
  {
    type: 'silver',
    name: 'Silver Award',
    emoji: '🥈',
    kshAmount: 200,
    description: 'A thoughtful token of recognition for insightful reporting and commentary.',
    perk: '+30 Karma',
  },
  {
    type: 'helpful',
    name: 'Helpful Award',
    emoji: '🤝',
    kshAmount: 350,
    description: 'Thank the contributor for clarifying critical facts or sharing educational analysis.',
    perk: '+50 Karma',
  },
  {
    type: 'rocket',
    name: 'Rocket Award',
    emoji: '🚀',
    kshAmount: 500,
    description: 'Accelerate high-velocity scoops, breaking football events, and investigative stories.',
    perk: '+80 Karma & Boost',
  },
  {
    type: 'mindblown',
    name: 'Mind Blown',
    emoji: '🤯',
    kshAmount: 1000,
    description: 'For paradigm-shifting opinions, deep investigative journalism, and rare perspectives.',
    perk: '+150 Karma',
  },
  {
    type: 'gold',
    name: 'Gold Award',
    emoji: '🥇',
    kshAmount: 2500,
    description: 'Prestigious award recognizing journalistic excellence and unmatched dedication.',
    perk: '+350 Karma & Gold Crest',
  },
  {
    type: 'platinum',
    name: 'Platinum Award',
    emoji: '💎',
    kshAmount: 5000,
    description: 'The highest civilian honor on Bloggr for transformative research and truth-telling.',
    perk: '+800 Karma & VIP Pin',
  },
];

export const AwardModal: React.FC = () => {
  const { awardModalTarget, closeAwardModal, giveAward } = useBloggr();
  const [selectedAward, setSelectedAward] = useState<AwardType>('gold');
  const [customGiftKsh, setCustomGiftKsh] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  if (!awardModalTarget) return null;

  const currentAward = AWARDS.find(a => a.type === selectedAward) || AWARDS[0];

  const effectiveGiftKsh = isCustomMode
    ? (parseFloat(customGiftKsh) || 0)
    : currentAward.kshAmount;

  const authorShareKsh = effectiveGiftKsh * AUTHOR_SHARE_RATIO;
  const adminShareKsh = effectiveGiftKsh * ADMIN_SHARE_RATIO;

  const handleConfirmAward = () => {
    if (effectiveGiftKsh <= 0) {
      return;
    }
    giveAward(selectedAward, effectiveGiftKsh);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Gift Author: u/{awardModalTarget.author}
              </h2>
              <p className="text-[11px] text-neutral-500">
                Direct monetary gift with automated 35% Admin / 65% Author revenue split
              </p>
            </div>
          </div>
          <button
            onClick={closeAwardModal}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Select Award & Monetary Gift
            </span>
            <button
              type="button"
              onClick={() => setIsCustomMode(prev => !prev)}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              {isCustomMode ? 'Choose from Preset Awards' : 'Enter Custom KSh Amount'}
            </button>
          </div>

          {!isCustomMode ? (
            /* Grid of awards with KSH values */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AWARDS.map(award => {
                const isSelected = selectedAward === award.type;
                const authorShare = award.kshAmount * AUTHOR_SHARE_RATIO;
                return (
                  <button
                    key={award.type}
                    type="button"
                    onClick={() => setSelectedAward(award.type)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 ring-2 ring-amber-500/30 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30'
                    }`}
                  >
                    <div className="text-2xl flex items-center justify-center h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-1.5">
                      <AwardFaIcon awardType={award.type} className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white truncate w-full">
                      {award.name}
                    </span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      KSh {award.kshAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      Author gets KSh {authorShare.toFixed(0)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom Amount Input */
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Custom Monetary Gift (Kenyan Shillings)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                  KSH
                </span>
                <input
                  type="number"
                  min="50"
                  max="100000"
                  step="50"
                  value={customGiftKsh}
                  onChange={e => setCustomGiftKsh(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full pl-12 pr-3 py-2.5 text-sm font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[100, 250, 500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomGiftKsh(amt.toString())}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-amber-500 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    KSh {amt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 35/65 Revenue Split Breakdown Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-neutral-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-neutral-900/50 border border-amber-200 dark:border-amber-900/50 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Transparent 35/65 Split Ledger</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                Total KSh {effectiveGiftKsh.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-800/80 border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Author Share</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">65%</span>
                </div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  KSh {authorShareKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Directly credited to u/{awardModalTarget.author}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Site Admin Share</span>
                  <span className="font-bold text-neutral-600 dark:text-neutral-400">35%</span>
                </div>
                <div className="text-base font-black text-neutral-800 dark:text-neutral-200 mt-1">
                  KSh {adminShareKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Platform hosting & infrastructure
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              All gifts and earnings are pooled transparently. Authors can monitor gift receipts and request automated Safaricom M-Pesa payouts from their Author Dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80">
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Coins className="w-4 h-4" />
            <span>KSh {effectiveGiftKsh.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={closeAwardModal}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-award-btn"
              onClick={handleConfirmAward}
              disabled={effectiveGiftKsh <= 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Gift {currentAward.emoji} (KSh {effectiveGiftKsh.toLocaleString()})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
