import { User, Car } from 'lucide-react';
import type { UserRole } from '@/types';

interface RoleSelectionProps {
  onSelectRole: (role: 'passenger' | 'driver') => void;
  onContinue: () => void;
  selectedRole: UserRole | null;
}

export function RoleSelection({ onSelectRole, onContinue, selectedRole }: RoleSelectionProps) {
  return (
    <div className="screen-container flex flex-col bg-white">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-extrabold text-ink-900">How will you use RYDO?</h1>
        <p className="mt-2 text-ink-500">Choose your role to get started.</p>
      </div>

      <div className="flex-1 px-6 space-y-4">
        <button
          onClick={() => onSelectRole('passenger')}
          className={`w-full p-6 rounded-3xl border-2 text-left transition-all ${
            selectedRole === 'passenger'
              ? 'border-brand-600 bg-brand-50 shadow-brand'
              : 'border-ink-100 bg-white hover:border-brand-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              selectedRole === 'passenger' ? 'bg-brand-600' : 'bg-ink-100'
            }`}>
              <User className={`w-7 h-7 ${selectedRole === 'passenger' ? 'text-white' : 'text-ink-500'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-ink-900">Passenger</h3>
              <p className="mt-1 text-sm text-ink-500">Book rides and commute smarter.</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelectRole('driver')}
          className={`w-full p-6 rounded-3xl border-2 text-left transition-all ${
            selectedRole === 'driver'
              ? 'border-brand-600 bg-brand-50 shadow-brand'
              : 'border-ink-100 bg-white hover:border-brand-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              selectedRole === 'driver' ? 'bg-brand-600' : 'bg-ink-100'
            }`}>
              <Car className={`w-7 h-7 ${selectedRole === 'driver' ? 'text-white' : 'text-ink-500'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-ink-900">Driver</h3>
              <p className="mt-1 text-sm text-ink-500">Earn more with predictable rides.</p>
            </div>
          </div>
        </button>
      </div>

      <div className="px-6 pb-10 pt-6">
        <button
          disabled={!selectedRole}
          onClick={onContinue}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${
            selectedRole
              ? 'bg-brand-600 text-white shadow-brand'
              : 'bg-ink-100 text-ink-300'
          }`}
        >
          Continue as {selectedRole === 'driver' ? 'Driver' : 'Passenger'}
        </button>
      </div>
    </div>
  );
}
