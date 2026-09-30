import React from 'react';
import { Check } from 'lucide-react';

interface VerifiedBadgeProps {
  isVerified?: boolean;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'shield' | 'check' | 'pill';
  className?: string;
  showText?: boolean;
  tooltip?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified = true,
  role,
  size = 'sm',
  variant = 'check',
  className = '',
  showText = false,
  tooltip,
}) => {
  if (!isVerified) return null;

  const defaultTooltip = role
    ? `Verified Author • ${role}`
    : 'Verified Author';

  const titleText = tooltip || defaultTooltip;
  
  const sizeMap = {
    xs: { wrap: 'w-3.5 h-3.5', icon: 'w-2 h-2' },
    sm: { wrap: 'w-4 h-4', icon: 'w-2.5 h-2.5' },
    md: { wrap: 'w-5 h-5', icon: 'w-3 h-3' },
    lg: { wrap: 'w-6 h-6', icon: 'w-3.5 h-3.5' },
  };

  const { wrap, icon } = sizeMap[size] || sizeMap.sm;

  if (variant === 'pill') {
    return (
      <span
        title={titleText}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 select-none ${className}`}
      >
        <span className="w-3 h-3 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
          <Check className="w-2 h-2 stroke-[3]" />
        </span>
        <span>Verified Author</span>
      </span>
    );
  }

  return (
    <span
      title={titleText}
      className={`inline-flex items-center gap-1 select-none flex-shrink-0 ${className}`}
    >
      <span className={`${wrap} rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs flex-shrink-0 ring-1 ring-orange-600/30`}>
        <Check className={`${icon} stroke-[3]`} />
      </span>
      {showText && (
        <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
          Verified
        </span>
      )}
    </span>
  );
};

