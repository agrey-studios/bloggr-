import React, { useState } from 'react';
import {
  Mail,
  Shield,
  FileText,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';

export const Footer: React.FC = () => {
  const {
    openPolicyModal,
    setMainNavTab,
    setActiveFeed,
    closeUserProfile,
    setActivePost,
    showToast,
    categoriesList,
  } = useBloggr();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    setNewsletterSubscribed(true);
    showToast('Subscribed to the Bloggr Morning Wire!');
    setNewsletterEmail('');
  };

  return (
    <footer
      id="platform-footer"
      className="mt-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 text-neutral-600 dark:text-neutral-400 select-none text-xs transition-colors hidden md:block"
      aria-label="Platform Footer"
    >
      {/* 1. Newsletter Callout Strip */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 py-8 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-neutral-50/60 dark:from-neutral-900 dark:via-neutral-900 dark:to-orange-950/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50">
              <Mail className="w-3 h-3" />
              <span>Daily Intelligence Briefing</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight">
              Get the Bloggr Wire in your inbox every morning
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-lg">
              Curated investigative reporting, African market moves, breaking politics, and top independent creator dispatches.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs shadow-xs"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold text-xs shadow-sm shadow-orange-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              {newsletterSubscribed ? 'Subscribed ✓' : 'Subscribe Free'}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Main Directory Columns */}
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Col 1: Brand Info */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              bloggr<span className="text-orange-500 text-3xl leading-none">.</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
              Media Network
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm">
            Bloggr is a next-generation news and creator publishing platform combining verified journalistic wire coverage, independent analysis, and reader engagement across Africa and the world.
          </p>
          <div className="flex items-center gap-3 pt-1 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>Nairobi · London · Cape Town</span>
            </span>
          </div>
        </div>

        {/* Col 2: News Desks */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
            News Desks
          </h4>
          <ul className="space-y-1.5 text-xs">
            {['Kenya', 'Africa', 'World', 'Politics', 'Business', 'Technology'].map(cat => (
              <li key={cat}>
                <button
                  onClick={() => {
                    closeUserProfile();
                    setActivePost(null);
                    setMainNavTab('news');
                    setActiveFeed(cat);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left"
                >
                  {cat} News
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Topics & Features */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
            Features & Media
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                onClick={() => {
                  closeUserProfile();
                  setActivePost(null);
                  setMainNavTab('football');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Football & Sports Hub
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  closeUserProfile();
                  setActivePost(null);
                  setMainNavTab('opinion');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Opinion & Columns
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  closeUserProfile();
                  setActiveFeed('trending');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Trending Stories
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  const writersBtn = document.getElementById('sidebar-explore-all-writers-btn');
                  if (writersBtn) writersBtn.click();
                }}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Verified Creators Directory
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Trust & Policies */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
            Trust & Transparency
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                onClick={() => openPolicyModal('editorial')}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left flex items-center gap-1"
              >
                <Award className="w-3 h-3 text-orange-500" />
                <span>Editorial Guidelines</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => openPolicyModal('privacy')}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left flex items-center gap-1"
              >
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Privacy & Data Rights</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => openPolicyModal('terms')}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-neutral-400" />
                <span>Terms of Service</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => openPolicyModal('monetization')}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Creator Monetization (65/35)</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => openPolicyModal('cookies')}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left"
              >
                Cookie Preferences
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright Bar */}
      <div className="border-t border-neutral-100 dark:border-neutral-800 py-6 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Bloggr Media Inc. All rights reserved. Independent news, culture, and creator publishing.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => openPolicyModal('privacy')}
              className="hover:underline"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => openPolicyModal('terms')}
              className="hover:underline"
            >
              Terms of Use
            </button>
            <span>·</span>
            <button
              onClick={() => openPolicyModal('cookies')}
              className="hover:underline"
            >
              Cookies
            </button>
            <span>·</span>
            <span className="text-neutral-400">v2.6 Enterprise Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
