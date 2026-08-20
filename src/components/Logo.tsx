interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

export function Logo({ className = '', showText = false, size = 'md' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${sizeMap[size]} relative flex-shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="24" fill="#0d9488" />
          <path d="M28 62 L72 62 L66 38 L34 38 Z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="36" cy="68" r="7" fill="#fff" />
          <circle cx="64" cy="68" r="7" fill="#fff" />
          <circle cx="36" cy="68" r="3" fill="#0d9488" />
          <circle cx="64" cy="68" r="3" fill="#0d9488" />
          <path d="M40 46 L60 46" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeMap[size]} font-extrabold tracking-tight text-ink-900 leading-none`}>RYDO</span>
          {size === 'lg' || size === 'xl' ? (
            <span className="lang-hi text-sm font-medium text-brand-600 mt-0.5">हर सफर बेफिकर</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
