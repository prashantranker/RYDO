import { useState } from 'react';
import { MapPin, Home, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { PreferredCommute } from '@/types';
import { ROUTES } from '@/lib/constants';

interface PassengerSetupProps {
  onDone: () => void;
}

const labelOptions = [
  { value: 'home' as const, label: 'Home', icon: Home },
  { value: 'work' as const, label: 'Work', icon: Briefcase },
  { value: 'college' as const, label: 'College', icon: GraduationCap },
];

export function PassengerSetup({ onDone }: PassengerSetupProps) {
  const { profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [homeLocation, setHomeLocation] = useState('');
  const [collegeLocation, setCollegeLocation] = useState('');
  const [frequentRoute, setFrequentRoute] = useState('');
  const [preferredCommute, setPreferredCommute] = useState<PreferredCommute>('both');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    if (profile) {
      await supabase.from('profiles').update({ preferred_commute_type: preferredCommute }).eq('id', profile.id);

      if (homeLocation) {
        await supabase.from('saved_locations').insert({
          user_id: profile.id,
          label: 'home',
          name: 'Home',
          address: homeLocation,
        });
      }
      if (collegeLocation) {
        await supabase.from('saved_locations').insert({
          user_id: profile.id,
          label: 'college',
          name: 'College',
          address: collegeLocation,
        });
      }
      await refreshProfile();
    }
    setSaving(false);
    onDone();
  }

  return (
    <div className="screen-container flex flex-col bg-white">
      <div className="px-6 pt-12 pb-4">
        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-brand-600' : 'bg-ink-100'}`} />
          ))}
        </div>
        <h1 className="text-3xl font-extrabold text-ink-900">Tell us about your commute</h1>
        <p className="mt-2 text-ink-500">We'll use this to find better rides for you.</p>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {step === 0 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Home Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-500" />
                <input
                  type="text"
                  value={homeLocation}
                  onChange={(e) => setHomeLocation(e.target.value)}
                  placeholder="e.g. Mohan Nagar"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">College / Work Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-500" />
                <input
                  type="text"
                  value={collegeLocation}
                  onChange={(e) => setCollegeLocation(e.target.value)}
                  placeholder="e.g. ABS College"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Frequently Travelled Route</label>
            <div className="space-y-2">
              {ROUTES.COLLEGE_CORRIDORS.slice(0, 8).map((route, i) => (
                <button
                  key={i}
                  onClick={() => setFrequentRoute(`${route.pickup} → ${route.destination}`)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all ${
                    frequentRoute === `${route.pickup} → ${route.destination}`
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-ink-100 hover:border-brand-300'
                  }`}
                >
                  <span className="font-semibold text-ink-800">{route.pickup} → {route.destination}</span>
                  {frequentRoute === `${route.pickup} → ${route.destination}` && (
                    <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <label className="block text-sm font-semibold text-ink-700 mb-3">Preferred Commute Type</label>
            <div className="space-y-3">
              {[
                { value: 'private' as const, title: 'Private', desc: 'Your ride. Your space.' },
                { value: 'shared' as const, title: 'Shared', desc: 'Same route. Better fare.' },
                { value: 'both' as const, title: 'Both', desc: 'I\'m flexible.' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPreferredCommute(opt.value)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    preferredCommute === opt.value
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-ink-100 hover:border-brand-300'
                  }`}
                >
                  <h3 className="font-bold text-ink-900">{opt.title}</h3>
                  <p className="text-sm text-ink-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => (step < 2 ? setStep(step + 1) : handleSave())}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {saving ? 'Saving...' : step < 2 ? 'Continue' : 'Continue to RYDO'}
        </button>
      </div>
    </div>
  );
}
