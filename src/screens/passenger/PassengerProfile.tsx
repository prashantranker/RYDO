import { useState, useEffect } from 'react';
import { User, MapPin, Heart, Settings, Shield, Bell, ChevronRight, LogOut, Star, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { SavedLocation } from '@/types';

export function PassengerProfile() {
  const { profile, signOut } = useAuth();
  const [locations, setLocations] = useState<SavedLocation[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase.from('saved_locations').select('*').eq('user_id', profile.id);
      setLocations((data as SavedLocation[]) ?? []);
    })();
  }, [profile]);

  return (
    <div className="screen-container bg-ink-50 pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900">Profile</h1>
      </div>

      <div className="px-5">
        <div className="bg-white rounded-3xl p-5 shadow-card flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
            {profile?.name?.[0]?.toUpperCase() ?? 'P'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-ink-900">{profile?.name ?? 'Passenger'}</h2>
            <p className="text-sm text-ink-500">{profile?.email ?? ''}</p>
            <p className="text-sm text-ink-500">{profile?.phone ?? ''}</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Saved Locations</h3>
        <div className="bg-white rounded-2xl shadow-card divide-y divide-ink-50">
          {locations.length > 0 ? (
            locations.map((loc) => (
              <div key={loc.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink-900 capitalize">{loc.label}</p>
                  <p className="text-sm text-ink-500">{loc.address}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-ink-400" />
              </div>
              <p className="text-sm text-ink-400">No saved locations yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Account</h3>
        <div className="bg-white rounded-2xl shadow-card divide-y divide-ink-50">
          <ProfileRow icon={CreditCard} label="Payment Methods" />
          <ProfileRow icon={Bell} label="Notifications" />
          <ProfileRow icon={Shield} label="Safety Settings" />
          <ProfileRow icon={Settings} label="App Settings" />
        </div>
      </div>

      <div className="px-5 mt-5">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-bold active:scale-[0.98] transition-transform"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      <div className="px-5 mt-6 text-center">
        <p className="text-xs text-ink-400">RYDO · हर सफर बेफिकर</p>
        <p className="text-xs text-ink-300 mt-1">Ride Milegi, Saath Bhi.</p>
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-4 hover:bg-ink-50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-ink-500" />
      </div>
      <span className="flex-1 text-left font-semibold text-ink-900">{label}</span>
      <ChevronRight className="w-5 h-5 text-ink-300" />
    </button>
  );
}
