import React from 'react';

interface FaviconLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  sublabel?: string;
  className?: string;
  fullscreen?: boolean;
}

export const FaviconLoader: React.FC<FaviconLoaderProps> = ({
  size = 'md',
  label,
  sublabel,
  className = '',
  fullscreen = false,
}) => {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Soft background pulse glow */}
        <div
          className={`absolute rounded-full bg-orange-500/30 dark:bg-orange-500/40 blur-xl animate-ping ${sizeMap[size]}`}
          style={{ animationDuration: '2.4s' }}
        />

        {/* Orbiting flame ring */}
        <div
          className={`absolute rounded-full border-2 border-dashed border-orange-400/50 dark:border-orange-500/40 animate-spin ${
            size === 'xl'
              ? 'w-28 h-28'
              : size === 'lg'
              ? 'w-20 h-20'
              : size === 'md'
              ? 'w-14 h-14'
              : 'w-10 h-10'
          }`}
          style={{ animationDuration: '6s' }}
        />

        {/* Bloggr Official Favicon Flame SVG */}
        <div
          className={`relative z-10 rounded-full shadow-lg shadow-orange-500/25 transition-transform animate-pulse ${sizeMap[size]}`}
          style={{ animationDuration: '1.6s' }}
        >
          <svg
            viewBox="0 0 512 512"
            className="w-full h-full drop-shadow-sm select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="256" cy="256" r="256" fill="#FA4616" />
            <path
              fill="#FFFFFF"
              d="M 258 70
                 C 258 70, 285 125, 262 178
                 C 248 210, 218 226, 196 250
                 C 178 270, 168 296, 170 326
                 C 160 310, 150 292, 148 272
                 C 144 246, 150 226, 142 214
                 C 136 205, 126 215, 120 228
                 C 106 268, 110 312, 130 352
                 C 155 400, 202 432, 256 438
                 C 316 444, 376 420, 412 374
                 C 442 334, 450 280, 436 228
                 C 424 186, 396 150, 362 122
                 C 350 112, 334 102, 324 94
                 C 328 116, 322 140, 310 160
                 C 298 180, 280 196, 262 210
                 C 248 222, 238 236, 236 254
                 C 234 270, 244 284, 258 290
                 C 274 296, 294 288, 302 274
                 C 310 260, 314 242, 314 224
                 C 340 254, 352 292, 346 332
                 C 340 366, 316 394, 284 406
                 C 248 418, 204 406, 180 378
                 C 156 350, 152 312, 168 280
                 C 176 264, 190 250, 202 236
                 C 226 206, 252 174, 258 134
                 C 262 108, 258 84, 258 70 Z"
            />
          </svg>
        </div>
      </div>

      {(label || sublabel) && (
        <div className="text-center space-y-0.5">
          {label && (
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 tracking-tight flex items-center justify-center gap-1.5">
              <span>{label}</span>
            </div>
          )}
          {sublabel && (
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm p-4">
        <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};
