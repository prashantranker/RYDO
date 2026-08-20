interface DoodleProps {
  className?: string;
}

export function AutoRickshawDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 95 L160 95 L150 55 L50 55 Z" stroke="#0d9488" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M55 55 L60 35 L140 35 L145 55" stroke="#0d9488" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="55" cy="105" r="14" stroke="#0d9488" strokeWidth="3" fill="white" />
      <circle cx="145" cy="105" r="14" stroke="#0d9488" strokeWidth="3" fill="white" />
      <circle cx="55" cy="105" r="5" fill="#0d9488" />
      <circle cx="145" cy="105" r="5" fill="#0d9488" />
      <path d="M75 70 L125 70" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M75 82 L115 82" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 120 Q50 110 80 120 T140 120 T180 120" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

export function RouteDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 100 Q60 100 60 60 Q60 20 100 20 Q140 20 140 60 Q140 100 180 100" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 6" fill="none" />
      <circle cx="20" cy="100" r="8" fill="#0d9488" />
      <circle cx="180" cy="100" r="8" fill="#fbbf24" stroke="#0d9488" strokeWidth="2" />
      <path d="M15 100 L-2 100 M20 95 L20 105" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
      <path d="M175 100 L192 100 M180 95 L180 105" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SharedRideDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35 90 L165 90 L155 50 L45 50 Z" stroke="#0d9488" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="50" cy="100" r="12" stroke="#0d9488" strokeWidth="3" fill="white" />
      <circle cx="150" cy="100" r="12" stroke="#0d9488" strokeWidth="3" fill="white" />
      <circle cx="70" cy="68" r="10" stroke="#f59e0b" strokeWidth="2.5" fill="#fef3c7" />
      <circle cx="100" cy="68" r="10" stroke="#f59e0b" strokeWidth="2.5" fill="#fef3c7" />
      <circle cx="130" cy="68" r="10" stroke="#f59e0b" strokeWidth="2.5" fill="#fef3c7" />
      <circle cx="70" cy="68" r="3" fill="#f59e0b" />
      <circle cx="100" cy="68" r="3" fill="#f59e0b" />
      <circle cx="130" cy="68" r="3" fill="#f59e0b" />
    </svg>
  );
}

export function CalendarDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="90" rx="10" stroke="#0d9488" strokeWidth="3" fill="white" />
      <path d="M40 55 L160 55" stroke="#0d9488" strokeWidth="3" />
      <path d="M65 20 L65 40 M135 20 L135 40" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
      <rect x="55" y="65" width="20" height="15" rx="3" fill="#fde68a" />
      <rect x="85" y="65" width="20" height="15" rx="3" fill="#0d9488" />
      <rect x="115" y="65" width="20" height="15" rx="3" fill="#fde68a" />
      <rect x="55" y="90" width="20" height="15" rx="3" fill="#fde68a" />
      <rect x="85" y="90" width="20" height="15" rx="3" fill="#fde68a" />
      <rect x="115" y="90" width="20" height="15" rx="3" fill="#fde68a" />
    </svg>
  );
}

export function MetroDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="45" width="140" height="55" rx="12" stroke="#0d9488" strokeWidth="3" fill="white" />
      <rect x="45" y="60" width="25" height="25" rx="4" stroke="#0d9488" strokeWidth="2" fill="#ccfbf1" />
      <rect x="85" y="60" width="25" height="25" rx="4" stroke="#0d9488" strokeWidth="2" fill="#ccfbf1" />
      <rect x="125" y="60" width="25" height="25" rx="4" stroke="#0d9488" strokeWidth="2" fill="#ccfbf1" />
      <circle cx="55" cy="105" r="10" stroke="#0d9488" strokeWidth="3" fill="white" />
      <circle cx="145" cy="105" r="10" stroke="#0d9488" strokeWidth="3" fill="white" />
      <path d="M20 115 L180 115" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function ChaiCupDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 40 L140 40 L130 100 L70 100 Z" stroke="#0d9488" strokeWidth="3" strokeLinejoin="round" fill="white" />
      <path d="M140 50 Q165 55 165 75 Q165 95 135 90" stroke="#0d9488" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M75 25 Q80 15 75 10 M95 25 Q100 15 95 10 M115 25 Q120 15 115 10" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M50 110 L150 110" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function LocationPinDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 20 C75 20 55 40 55 65 C55 95 100 120 100 120 C100 120 145 95 145 65 C145 40 125 20 100 20 Z" stroke="#0d9488" strokeWidth="3" fill="white" />
      <circle cx="100" cy="62" r="15" stroke="#f59e0b" strokeWidth="3" fill="#fef3c7" />
      <circle cx="100" cy="62" r="5" fill="#f59e0b" />
    </svg>
  );
}

export function HelmetDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 80 Q50 35 100 35 Q150 35 150 80 L150 95 L50 95 Z" stroke="#0d9488" strokeWidth="3" fill="white" strokeLinejoin="round" />
      <path d="M50 80 L150 80" stroke="#0d9488" strokeWidth="2" opacity="0.4" />
      <path d="M100 35 L100 80" stroke="#0d9488" strokeWidth="2" opacity="0.4" />
      <path d="M150 85 Q170 85 170 100 L150 100" stroke="#0d9488" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function BackpackDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="55" y="40" width="90" height="80" rx="12" stroke="#0d9488" strokeWidth="3" fill="white" />
      <path d="M70 40 Q70 20 100 20 Q130 20 130 40" stroke="#0d9488" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="75" y="55" width="50" height="25" rx="5" stroke="#f59e0b" strokeWidth="2.5" fill="#fef3c7" />
      <path d="M95 67 L105 67" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IndiaGateDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 110 L60 50 Q60 40 100 40 Q140 40 140 50 L140 110" stroke="#0d9488" strokeWidth="3" fill="white" strokeLinejoin="round" />
      <path d="M55 50 Q100 30 145 50" stroke="#0d9488" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M75 110 L75 60 M125 110 L125 60" stroke="#0d9488" strokeWidth="2" opacity="0.4" />
      <path d="M85 45 L85 35 L115 35 L115 45" stroke="#0d9488" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M50 110 L150 110" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function EmptyStateDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="70" r="50" stroke="#0d9488" strokeWidth="3" fill="white" strokeDasharray="6 6" />
      <path d="M80 60 Q100 45 120 60" stroke="#0d9488" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="85" cy="80" r="3" fill="#0d9488" />
      <circle cx="115" cy="80" r="3" fill="#0d9488" />
      <path d="M85 95 Q100 100 115 95" stroke="#0d9488" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function SearchingDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="60" r="35" stroke="#0d9488" strokeWidth="3" fill="none" strokeDasharray="10 6" className="animate-spin-slow" style={{ transformOrigin: '100px 60px' }} />
      <circle cx="100" cy="60" r="20" stroke="#f59e0b" strokeWidth="3" fill="#fef3c7" />
      <path d="M100 50 L100 70 M90 60 L110 60" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M70 110 Q100 100 130 110" stroke="#0d9488" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function SuccessDoodle({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="65" r="45" stroke="#0d9488" strokeWidth="3" fill="#f0fdfa" />
      <path d="M75 65 L92 82 L125 48" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M40 30 L45 25 M160 30 L155 25 M30 100 L25 105 M170 100 L175 105" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
