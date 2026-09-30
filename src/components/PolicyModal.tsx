import React from 'react';
import {
  X,
  Shield,
  FileCheck,
  BookOpen,
  Scale,
  CheckCircle2,
  ExternalLink,
  Copy,
  Lock,
  Award,
  Sparkles,
  Cookie,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { PolicyPageId } from '../types';

export const PolicyModal: React.FC = () => {
  const { policyModalPage, openPolicyPage, closePolicyPage, showToast } = useBloggr();

  if (!policyModalPage) return null;

  const tabs: { id: NonNullable<PolicyPageId>; label: string; icon: React.ReactNode }[] = [
    { id: 'privacy', label: 'Privacy Policy', icon: <Shield className="w-4 h-4" /> },
    { id: 'terms', label: 'Terms of Service', icon: <Scale className="w-4 h-4" /> },
    { id: 'content-policy', label: 'Content Policy', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'user-agreement', label: 'User Agreement', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'editorial', label: 'Editorial Guidelines', icon: <Award className="w-4 h-4" /> },
    { id: 'monetization', label: 'Monetization (65/35)', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'cookies', label: 'Cookie Preferences', icon: <Cookie className="w-4 h-4" /> },
  ];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + `#policy-${policyModalPage}`);
    showToast(`Copied ${tabs.find(t => t.id === policyModalPage)?.label} link!`);
  };

  return (
    <div
      id="policy-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={closePolicyPage}
    >
      <div
        id="policy-modal-container"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                Bloggr Legal & Policies
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Official guidelines, terms, and privacy protocols.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy policy reference"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              id="close-policy-modal-btn"
              onClick={closePolicyPage}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 px-4 bg-white dark:bg-neutral-900 scrollbar-none">
          {tabs.map(tab => {
            const isActive = policyModalPage === tab.id;
            return (
              <button
                key={tab.id}
                id={`policy-tab-${tab.id}`}
                onClick={() => openPolicyPage(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed">
          {policyModalPage === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Effective Date: October 2024
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                  Bloggr Privacy Policy
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  How Bloggr collects, protects, processes, and respects your identity and interactions.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  1. Information We Collect
                </h3>
                <p>
                  We collect information you provide directly to us when you create an account, customize your profile, apply for verified creator privileges, submit posts, or interact with comments and communities.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600 dark:text-neutral-300 ml-2">
                  <li><strong>Account Credentials:</strong> Username, profile bio, avatar image, and community subscription list.</li>
                  <li><strong>Creator Applications:</strong> Categories of interest, professional background, sample writing topics, and portfolio URLs provided during manual creator verification.</li>
                  <li><strong>Content & Interactions:</strong> Post submissions, upvotes, downvotes, bookmarks, and awards sent across communities.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  2. How We Use Data
                </h3>
                <p>
                  Bloggr uses your data to operate, improve, and secure our social community platform:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600 dark:text-neutral-300 ml-2">
                  <li>Enforcing community moderation and creator verification standards.</li>
                  <li>Delivering your tailored feed (Home, Popular, and Subscribed communities).</li>
                  <li>Preventing spam, automated scraping, harassment, and unauthorized posting.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  3. Cookies and Local Storage
                </h3>
                <p>
                  We utilize browser Local Storage to preserve your session state, dark mode preferences, bookmarked items, and karma tallies locally on your device for fast performance.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  4. Your Privacy Rights (GDPR & CCPA)
                </h3>
                <p>
                  You retain full control over your personal data. You may export your activity or reset local session cache at any time using the Reset Data option in the user menu.
                </p>
              </section>
            </div>
          )}

          {policyModalPage === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Last Updated: October 2024
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                  Terms of Service
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Please review the rules governing your usage of Bloggr and content contributions.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or browsing Bloggr, participating in discussions, upvoting content, or applying for creator privileges, you agree to be bound by these Terms of Service.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  2. Creator Posting Privilege & Admin Review
                </h3>
                <p>
                  To maintain rigorous journalistic quality and eliminate low-effort spam, <strong>only verified Creators approved by Bloggr Administrators are authorized to publish new posts</strong>. Users must submit an application detailing their expertise and sample topics. Admins reserve the right to approve, review, or revoke creator status.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  3. Community Standards & Conduct
                </h3>
                <p>
                  All users agree to engage in constructive dialogue. Defamatory speech, hate speech, doxxing, harassment, and copyright infringement are strictly prohibited and result in immediate revocation of account privileges.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  4. Intellectual Property
                </h3>
                <p>
                  Authors retain copyright over their original writing, imagery, and analyses submitted to Bloggr, granting Bloggr a worldwide license to display and distribute the post across the network.
                </p>
              </section>
            </div>
          )}

          {policyModalPage === 'content-policy' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Community Integrity Rules
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                  Bloggr Content Policy
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Our universal baseline standards for posts, discussions, and shared links.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
                  <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Rule 1: Remember the Human
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Treat fellow readers and creators with dignity. Attack arguments and theories, never individuals or groups based on protected traits.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
                  <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Rule 2: Authentic Content & Attribution
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Always credit source publications, original researchers, photographers, and developers when synthesizing news or scientific findings.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
                  <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Rule 3: No Deceptive Clickbait or Fraud
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Titles must accurately represent the content. Misleading claims, phishing links, and deceptive affiliate traps are immediately removed.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
                  <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Rule 4: Community Topic Relevance
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Posts must align with the specific topic of the community (e.g. tech breakthroughs in b/technology, market analysis in b/startups).
                  </p>
                </div>
              </div>
            </div>
          )}

          {policyModalPage === 'user-agreement' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Standard Member Agreement
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                  User Agreement
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Terms governing account creation, karma scores, community participation, and safety.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  1. Your Account & Profile
                </h3>
                <p>
                  You are responsible for safeguarding your profile and all activities occurring under your username. You agree to provide honest information during Creator verification.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  2. Karma, Awards, and Reputation
                </h3>
                <p>
                  Karma points and awards are virtual tokens signifying community contribution and peer recognition. They carry no monetary value and may not be traded or redeemed for currency.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  3. Admin Discretion & Manual Moderation
                </h3>
                <p>
                  Bloggr staff and volunteer community moderators hold final authority to arbitrate disputes, curate feed feeds, review creator candidacy, and enforce community health.
                </p>
              </section>
            </div>
          )}

          {policyModalPage === 'editorial' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Journalistic Ethics & Standards
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                  Bloggr Editorial Guidelines
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Commitment to factual integrity, verifiable reporting, attribution, and independent analysis.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  1. Fact-Checking & Primary Sources
                </h3>
                <p>
                  All breaking dispatches and investigatory reports must cite verifiable sources, primary documents, or first-hand quotes. Independent creators are expected to distinguish between reported facts and editorial opinions.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  2. Corrections and Retractions
                </h3>
                <p>
                  When material errors occur, editors and authors must update the piece promptly with an explicit "Correction Note" at the top or bottom outlining the amendment.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  3. Conflicts of Interest & Sponsored Content
                </h3>
                <p>
                  Any financial backing, sponsored reviews, or commercial ties must be disclosed with native sponsored labels. Secret promotional coverage is strictly prohibited.
                </p>
              </section>
            </div>
          )}

          {policyModalPage === 'monetization' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Creator Economics
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                  Bloggr Creator Monetization (65 / 35 Split)
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Direct revenue sharing on ad impressions, reader tip awards, and premium subscriptions.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  1. The 65% Creator Guarantee
                </h3>
                <p>
                  Verified authors and journalists keep 65% of all ad-revenue generated across their article impressions and short-form video views. Bloggr retains 35% to fund infrastructure, high-speed CDN, and platform development.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  2. M-Pesa & Mobile Money Direct Payouts
                </h3>
                <p>
                  Earnings are settled on the 1st of every month directly to your verified Safaricom M-Pesa phone number or international bank account with a minimum withdrawal threshold of KSh 500 ($5 USD).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  3. Reader Awards & Claps
                </h3>
                <p>
                  Readers can award Gold, Platinum, and Rocket badges to exemplary articles. 90% of award token value is credited directly to the writer's wallet.
                </p>
              </section>
            </div>
          )}

          {policyModalPage === 'cookies' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Consent & Storage
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                  Cookie & Local Storage Preferences
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Understand how Bloggr manages browser memory and local cache for your device.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  1. Essential Session Cookies
                </h3>
                <p>
                  We store essential authentication credentials and theme preferences (Dark vs. Light mode) to ensure you stay signed in seamlessly without re-authenticating on every page refresh.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  2. Offline Reading Cache
                </h3>
                <p>
                  Articles marked for "Read Later" are cached in IndexedDB and browser local storage so you can access saved dispatches even with slow or intermittent connectivity.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs text-neutral-500">
          <span>Bloggr Open Web Standards</span>
          <button
            onClick={closePolicyPage}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
