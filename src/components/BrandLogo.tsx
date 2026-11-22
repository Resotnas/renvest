import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-14 h-14 rounded-[20px]',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[1px] shadow-lg shadow-emerald-500/25`}
      >
        <div className="w-full h-full rounded-[inherit] bg-slate-950/90 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-[65%] h-[65%]" fill="none">
            <defs>
              <linearGradient id="rvGrad" x1="4" y1="30" x2="32" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <path
              d="M6 26L14 18L19.5 22L30 9.5"
              stroke="url(#rvGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23.5 9.5H30V16"
              stroke="url(#rvGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${textSizes[size]} font-display font-extrabold tracking-tight text-primary`}>
          Ren<span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Vest</span>
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-secondary mt-1 tracking-wide">
            Inteligência em Investimentos
          </span>
        )}
      </div>
    </div>
  );
};
