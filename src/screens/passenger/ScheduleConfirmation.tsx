import { SuccessDoodle, CalendarDoodle } from '@/components/Doodles';
import { Check } from 'lucide-react';

interface ScheduleConfirmationProps {
  pickup: string;
  destination: string;
  date: string;
  time: string;
  onDone: () => void;
  onSubscribe: () => void;
}

export function ScheduleConfirmation({ pickup, destination, date, time, onDone, onSubscribe }: ScheduleConfirmationProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="screen-container bg-ink-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="animate-fade-in-up flex flex-col items-center">
          <div className="w-32 h-24 mb-6">
            <CalendarDoodle className="w-full h-full" />
          </div>
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-brand-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-ink-900 text-center">Your commute is scheduled</h2>

          <div className="mt-6 w-full max-w-xs bg-white rounded-3xl p-5 shadow-card">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex flex-col items-center pt-1">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <div className="w-0.5 h-10 bg-ink-200" />
                <div className="w-3 h-3 rounded-sm bg-accent-500" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-bold text-ink-900">{pickup}</p>
                <p className="font-bold text-ink-900 mt-3">{destination}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-ink-100">
              <div>
                <p className="text-xs text-ink-400 font-semibold uppercase">Date</p>
                <p className="font-bold text-ink-900">{formattedDate}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 font-semibold uppercase">Time</p>
                <p className="font-bold text-ink-900">{time}</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-ink-500 text-center max-w-xs">
            We'll find a driver for your route and notify you when one is assigned.
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-3">
        <button
          onClick={onSubscribe}
          className="w-full py-4 rounded-2xl bg-accent-50 border border-accent-200 text-accent-700 font-bold active:scale-[0.98] transition-transform"
        >
          Subscribe to this Route
        </button>
        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform"
        >
          Done
        </button>
      </div>
    </div>
  );
}
