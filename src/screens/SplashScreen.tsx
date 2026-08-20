import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { AutoRickshawDoodle } from '@/components/Doodles';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className="screen-container flex flex-col items-center justify-center bg-gradient-to-b from-brand-600 via-brand-700 to-brand-800">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg viewBox="0 0 400 800" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <path d="M0 200 Q100 180 100 100 Q100 20 200 20 Q300 20 300 100 Q300 180 400 200" stroke="white" strokeWidth="2" fill="none" strokeDasharray="12 8" />
          <path d="M0 500 Q100 480 100 400 Q100 320 200 320 Q300 320 300 400 Q300 480 400 500" stroke="white" strokeWidth="2" fill="none" strokeDasharray="12 8" />
          <circle cx="200" cy="20" r="6" fill="white" opacity="0.5" />
          <circle cx="300" cy="320" r="6" fill="white" opacity="0.5" />
        </svg>
      </div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="animate-float">
          <Logo size="xl" />
        </div>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white">RYDO</h1>
        <p className="lang-hi mt-3 text-xl font-medium text-brand-100">हर सफर बेफिकर</p>
        <p className="mt-1.5 text-sm font-medium text-brand-200 tracking-wide">Ride Milegi, Saath Bhi.</p>
      </div>

      <div className={`absolute bottom-24 left-0 right-0 flex justify-center transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <AutoRickshawDoodle className="w-32 h-20 opacity-90" />
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-[2500ms] ease-out" style={{ width: phase >= 1 ? '100%' : '0%' }} />
        </div>
      </div>
    </div>
  );
}
