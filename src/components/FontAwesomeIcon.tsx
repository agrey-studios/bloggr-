import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faEarthAfrica,
  faEarthAmericas,
  faFlag,
  faFutbol,
  faMedal,
  faPenNib,
  faFire,
  faBookmark,
  faTrophy,
  faCoins,
  faRocket,
  faHandshake,
  faGem,
  faNewspaper,
  faCamera,
  faBolt,
  faComments,
  faStar,
  faCertificate,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface CategoryFaIconProps {
  categoryId: string;
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | '1x' | '2x';
}

export const CategoryFaIcon: React.FC<CategoryFaIconProps> = ({ categoryId, className = 'w-3.5 h-3.5', size }) => {
  let icon: IconDefinition = faGlobe;
  let defaultColor = 'text-blue-500 dark:text-blue-400';

  const normalized = categoryId.toLowerCase();

  if (normalized.includes('africa')) {
    icon = faEarthAfrica;
    defaultColor = 'text-emerald-500 dark:text-emerald-400';
  } else if (normalized.includes('kenya')) {
    icon = faFlag;
    defaultColor = 'text-red-500 dark:text-red-400';
  } else if (normalized.includes('football')) {
    icon = faFutbol;
    defaultColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (normalized.includes('sports') || normalized.includes('other-sports')) {
    icon = faMedal;
    defaultColor = 'text-amber-500 dark:text-amber-400';
  } else if (normalized.includes('opinion')) {
    icon = faPenNib;
    defaultColor = 'text-purple-500 dark:text-purple-400';
  } else if (normalized.includes('global') || normalized.includes('world')) {
    icon = faEarthAmericas;
    defaultColor = 'text-cyan-500 dark:text-cyan-400';
  } else if (normalized.includes('popular') || normalized.includes('trending')) {
    icon = faFire;
    defaultColor = 'text-orange-500 dark:text-orange-400';
  } else if (normalized.includes('saved')) {
    icon = faBookmark;
    defaultColor = 'text-amber-500 dark:text-amber-400';
  }

  return (
    <span className={`inline-flex items-center justify-center ${defaultColor}`}>
      <FontAwesomeIcon icon={icon} className={className} size={size} />
    </span>
  );
};

export interface AwardFaIconProps {
  awardType: string;
  className?: string;
}

export const AwardFaIcon: React.FC<AwardFaIconProps> = ({ awardType, className = 'w-3.5 h-3.5' }) => {
  let icon: IconDefinition = faTrophy;
  let color = 'text-yellow-500';

  switch (awardType.toLowerCase()) {
    case 'gold':
      icon = faTrophy;
      color = 'text-amber-400';
      break;
    case 'platinum':
      icon = faGem;
      color = 'text-cyan-400';
      break;
    case 'helpful':
      icon = faHandshake;
      color = 'text-emerald-400';
      break;
    case 'rocket':
      icon = faRocket;
      color = 'text-orange-400';
      break;
    case 'mindblown':
      icon = faBolt;
      color = 'text-violet-400';
      break;
    case 'silver':
      icon = faMedal;
      color = 'text-slate-300';
      break;
    default:
      icon = faStar;
      color = 'text-amber-400';
  }

  return (
    <span className={`inline-flex items-center justify-center ${color}`}>
      <FontAwesomeIcon icon={icon} className={className} />
    </span>
  );
};

export {
  FontAwesomeIcon,
  faGlobe,
  faEarthAfrica,
  faEarthAmericas,
  faFlag,
  faFutbol,
  faMedal,
  faPenNib,
  faFire,
  faBookmark,
  faTrophy,
  faCoins,
  faRocket,
  faHandshake,
  faGem,
  faNewspaper,
  faCamera,
  faBolt,
  faComments,
  faStar,
  faCertificate,
};
