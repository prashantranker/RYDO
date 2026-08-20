import { useState } from 'react';
import { SharedRideDoodle, CalendarDoodle, RouteDoodle } from '@/components/Doodles';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    headline: 'Your Ride. Your Route.',
    description: 'Private ho ya shared, apni journey ka smarter way choose karo.',
    Doodle: RouteDoodle,
  },
  {
    headline: 'Ride Milegi, Saath Bhi.',
    description: 'Same route? Ride share karo, fare save karo.',
    Doodle: SharedRideDoodle,
  },
  {
    headline: 'Daily Commute, Sorted.',
    description: 'Schedule karo, demand predict karo aur daily travel ko predictable banao.',
    Doodle: CalendarDoodle,
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const Doodle = slide.Doodle;
  const isLast = index === slides.length - 1;

  return (
    <div className="screen-container flex flex-col bg-white">
      <div className="flex justify-end p-5">
        <button
          onClick={onComplete}
          className="text-sm font-semibold text-ink-400 hover:text-ink-600 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div key={index} className="animate-fade-in-up flex flex-col items-center">
          <div className="w-56 h-44 flex items-center justify-center mb-8">
            <Doodle className="w-full h-full" />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-ink-900 leading-tight">
            {slide.headline}
          </h2>
          <p className="mt-4 text-base text-ink-500 text-center leading-relaxed max-w-xs">
            {slide.description}
          </p>
        </div>
      </div>

      <div className="px-8 pb-10">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-brand-600' : 'w-2 bg-ink-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => (isLast ? onComplete() : setIndex(index + 1))}
          className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform"
        >
          {isLast ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
