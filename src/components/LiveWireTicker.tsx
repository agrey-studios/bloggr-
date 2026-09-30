import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Radio,
  Clock,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post } from '../types';

export const LiveWireTicker: React.FC = () => {
  const { posts, setActivePost } = useBloggr();

  // Top breaking or latest posts with content
  const breakingStories = useMemo(() => {
    const breaking = posts.filter(p => p.isBreaking || p.score > 200);
    return breaking.length > 0 ? breaking.slice(0, 8) : posts.slice(0, 6);
  }, [posts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Financial & Weather Live Indicators
  const marketIndicators = [
    { label: 'USD/KES', value: '129.40', change: '+0.15%', isUp: true },
    { label: 'EUR/KES', value: '141.85', change: '+0.28%', isUp: true },
    { label: 'GBP/KES', value: '171.20', change: '-0.08%', isUp: false },
    { label: 'Brent Crude', value: '$74.60', change: '+0.9%', isUp: true },
    { label: 'Nairobi', value: '24°C ☀️', change: '', isUp: true },
  ];

  const [marketIndex, setMarketIndex] = useState(0);

  // Auto-advance breaking headlines every 5.5 seconds
  useEffect(() => {
    if (breakingStories.length <= 1 || isPaused || isSpeaking) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % breakingStories.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [breakingStories.length, isPaused, isSpeaking]);

  // Auto-advance market ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketIndex(prev => (prev + 1) % marketIndicators.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [marketIndicators.length]);

  const activeStory = breakingStories[currentIndex];

  // Stop speech when component unmounts or story changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !activeStory) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${activeStory.title}. Published by ${activeStory.author}. ${activeStory.summary || activeStory.content || ''}`;
      const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 350));
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleSelectStory = (post: Post) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setActivePost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!activeStory) return null;

  const currentMarket = marketIndicators[marketIndex];

  return (
    <div
      id="live-wire-ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-neutral-900 text-white border-b border-neutral-800 text-xs overflow-hidden select-none relative z-30 shadow-xs"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 h-9 sm:h-10 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Glowing Pulse Live Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-red-600/90 text-white font-black text-[10px] sm:text-[11px] tracking-wider uppercase shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>WIRE</span>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>UPDATES:</span>
          </span>
        </div>

        {/* Center: Interactive Cycling Headline */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <button
            onClick={() => handleSelectStory(activeStory)}
            className="group flex-1 min-w-0 text-left flex items-center gap-2 hover:opacity-95 transition-opacity"
            title="Read full breaking story"
          >
            {activeStory.category && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-neutral-800 text-orange-400 border border-neutral-700 flex-shrink-0">
                {activeStory.category}
              </span>
            )}
            <span className="truncate text-xs sm:text-sm font-semibold text-neutral-100 group-hover:text-orange-400 group-hover:underline underline-offset-2 transition-colors">
              {activeStory.title}
            </span>
          </button>

          {/* Quick Voice / Speech Reader Toggle */}
          <button
            onClick={handleToggleSpeech}
            className={`p-1 sm:px-2 sm:py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors flex-shrink-0 ${
              isSpeaking
                ? 'bg-orange-500 text-white animate-pulse'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
            title={isSpeaking ? 'Stop narration' : 'Listen to headline'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Stop</span>
                {/* Mini audio equalizer wave */}
                <span className="flex items-center gap-0.5 h-3 ml-0.5">
                  <span className="w-0.5 bg-white rounded-full animate-eq-1"></span>
                  <span className="w-0.5 bg-white rounded-full animate-eq-2"></span>
                  <span className="w-0.5 bg-white rounded-full animate-eq-3"></span>
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden lg:inline text-[11px]">Listen</span>
              </>
            )}
          </button>

          {/* Prev / Next controls */}
          <div className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => setCurrentIndex(prev => (prev - 1 + breakingStories.length) % breakingStories.length)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Previous dispatch"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-neutral-500 px-0.5">
              {currentIndex + 1}/{breakingStories.length}
            </span>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % breakingStories.length)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Next dispatch"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: World Financial & Climate Micro-Pulse */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-neutral-800 flex-shrink-0 text-[11px]">
          <span className="text-neutral-400 font-medium">MARKETS:</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-neutral-200 font-bold">{currentMarket.label}</span>
            <span className="text-neutral-100">{currentMarket.value}</span>
            {currentMarket.change && (
              <span
                className={`font-semibold text-[10px] ${
                  currentMarket.isUp ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {currentMarket.change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
