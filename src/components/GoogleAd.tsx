import React, { useState } from 'react';
import { Info, X, ExternalLink, Sparkles } from 'lucide-react';

interface GoogleAdProps {
  format?: 'sidebar' | 'in-article' | 'compact';
  slotId?: number | string;
  className?: string;
}

interface AdCreative {
  headline: string;
  body: string;
  advertiser: string;
  displayUrl: string;
  ctaText: string;
  imageUrl?: string;
  category: string;
}

const AD_CREATIVES: AdCreative[] = [
  {
    headline: 'Build faster with Google Cloud Infrastructure',
    body: 'Deploy production-grade applications, scalable compute instances, and managed databases with global reliability.',
    advertiser: 'Google Cloud',
    displayUrl: 'cloud.google.com/solutions',
    ctaText: 'Start Free Trial',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    category: 'Cloud Computing',
  },
  {
    headline: 'Google Workspace — Smart collaboration for teams',
    body: 'Integrated real-time documents, custom email domains, and enterprise-grade security across your organization.',
    advertiser: 'Google Workspace',
    displayUrl: 'workspace.google.com',
    ctaText: 'Learn More',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    category: 'Productivity',
  },
  {
    headline: 'Scalable Edge Infrastructure for Modern Web Apps',
    body: 'High-throughput caching, global DNS, and sub-10ms latency worldwide. Get $300 in test credits today.',
    advertiser: 'Cloud Compute Global',
    displayUrl: 'network.compute.io',
    ctaText: 'Deploy Now',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    category: 'Developer Tools',
  },
  {
    headline: 'Next-Gen Developer Tools for Full-Stack Teams',
    body: 'Automate container pipelines, continuous integration, and real-time observability in minutes.',
    advertiser: 'DevForge Systems',
    displayUrl: 'devforge.tech/cloud',
    ctaText: 'Explore Docs',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    category: 'Software Engineering',
  },
];

export const GoogleAd: React.FC<GoogleAdProps> = ({
  format = 'sidebar',
  slotId = 0,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Pick ad creative deterministically based on slotId
  const index = typeof slotId === 'number'
    ? Math.abs(slotId) % AD_CREATIVES.length
    : Math.abs(slotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % AD_CREATIVES.length;

  const ad = AD_CREATIVES[index];

  if (isDismissed) {
    return (
      <div className={`p-3 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-center text-xs text-neutral-400 ${className}`}>
        <span>Ad closed. Thank you for your feedback.</span>
      </div>
    );
  }

  // 1. IN-ARTICLE FORMAT (Native editorial responsive banner)
  if (format === 'in-article') {
    return (
      <aside
        id={`ad-slot-in-article-${slotId}`}
        aria-label="Advertisement"
        className={`my-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/70 p-3 sm:p-4 shadow-xs relative overflow-hidden transition-all ${className}`}
      >
        {/* Ad Header Row: Ad badge & AdChoices */}
        <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider text-[9px]">
              Ad
            </span>
            <span className="text-neutral-500 font-medium">Sponsored by {ad.advertiser}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowInfo(prev => !prev)}
              className="hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
              title="About this Google Ad"
            >
              <Info className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
              title="Close Ad"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Info Overlay */}
        {showInfo && (
          <div className="mb-2 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-300 animate-in fade-in duration-150">
            <p className="font-semibold text-neutral-900 dark:text-white mb-0.5">About Google Ads</p>
            <p>This advertisement is served via Google AdSense based on relevance and context. Manage your ad personalization preferences anytime.</p>
          </div>
        )}

        {/* Ad Content: Banner Grid */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {ad.imageUrl && (
            <div className="w-full sm:w-36 h-24 sm:h-20 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex-shrink-0">
              <img
                src={ad.imageUrl}
                alt={ad.headline}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1 text-left">
            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white leading-snug line-clamp-2">
              {ad.headline}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {ad.body}
            </p>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              {ad.displayUrl}
            </div>
          </div>

          <div className="w-full sm:w-auto flex-shrink-0">
            <a
              href={`https://${ad.displayUrl}`}
              target="_blank"
              rel="noreferrer noopener sponsored"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer attribution */}
        <div className="mt-2.5 pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[9px] text-neutral-400">
          <span>Ads by Google</span>
          <span className="hover:underline cursor-pointer">AdChoices</span>
        </div>
      </aside>
    );
  }

  // 2. SIDEBAR FORMAT (300x250 Medium Rectangle or Responsive Display Ad)
  return (
    <aside
      id={`ad-slot-sidebar-${slotId}`}
      aria-label="Advertisement"
      className={`rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3.5 shadow-sm space-y-2.5 overflow-hidden ${className}`}
    >
      {/* Ad Label & Dismiss */}
      <div className="flex items-center justify-between text-[10px] text-neutral-400">
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold uppercase text-[9px]">
            Ad
          </span>
          <span>Google Ad</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInfo(prev => !prev)}
            className="hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
            title="Ad info"
          >
            <Info className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
            title="Dismiss ad"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-300">
          <p className="font-semibold text-neutral-900 dark:text-white mb-0.5">Google AdSense</p>
          <p>Contextual responsive display ad served by Google.</p>
        </div>
      )}

      {/* Ad Graphic Banner */}
      {ad.imageUrl && (
        <div className="relative rounded-xl overflow-hidden aspect-[21/9] sm:aspect-[16/9] bg-neutral-900 group">
          <img
            src={ad.imageUrl}
            alt={ad.headline}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold">
            {ad.category}
          </div>
        </div>
      )}

      {/* Headline & Body */}
      <div className="space-y-1">
        <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white leading-snug hover:text-blue-600 transition-colors">
          {ad.headline}
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3">
          {ad.body}
        </p>
        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate pt-0.5">
          {ad.displayUrl}
        </div>
      </div>

      {/* CTA Button */}
      <a
        href={`https://${ad.displayUrl}`}
        target="_blank"
        rel="noreferrer noopener sponsored"
        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
      >
        <span>{ad.ctaText}</span>
        <ExternalLink className="w-3 h-3" />
      </a>

      {/* Footer attribution */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[9px] text-neutral-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
          Ads by Google
        </span>
        <span className="hover:underline cursor-pointer">AdChoices</span>
      </div>
    </aside>
  );
};
