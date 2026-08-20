import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Repeat } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
import { EmptyStateDoodle, CalendarDoodle } from '@/components/Doodles';
import type { Ride, Subscription } from '@/types';

interface PassengerScheduleProps {
  onSchedule: (data: { pickup: string; destination: string; date: string; time: string }) => void;
}

export function PassengerSchedule({ onSchedule }: PassengerScheduleProps) {
  const { profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [scheduledRides, setScheduledRides] = useState<Ride[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [subPickup, setSubPickup] = useState('');
  const [subDest, setSubDest] = useState('');
  const [subTime, setSubTime] = useState('09:00');
  const [subDays, setSubDays] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: subs } = await supabase.from('subscriptions').select('*').eq('passenger_id', profile.id);
      setSubscriptions((subs as Subscription[]) ?? []);

      const { data: rides } = await supabase
        .from('rides')
        .select('*')
        .eq('passenger_id', profile.id)
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: true });
      setScheduledRides((rides as Ride[]) ?? []);
    })();
  }, [profile]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  async function handleSubscribe() {
    if (!profile || !subPickup || !subDest) return;
    await supabase.from('subscriptions').insert({
      passenger_id: profile.id,
      pickup_name: subPickup,
      destination_name: subDest,
      route_name: `${subPickup} → ${subDest}`,
      days_of_week: subDays,
      departure_time: subTime,
      commute_type: 'shared',
      active: true,
    });
    const { data } = await supabase.from('subscriptions').select('*').eq('passenger_id', profile.id);
    setSubscriptions((data as Subscription[]) ?? []);
    setShowForm(false);
    setSubPickup('');
    setSubDest('');
  }

  async function toggleSub(id: string, active: boolean) {
    await supabase.from('subscriptions').update({ active: !active }).eq('id', id);
    setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, active: !active } : s));
  }

  return (
    <div className="screen-container bg-ink-50 pb-24">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Schedule</h1>
          <p className="text-sm text-ink-500">Plan your daily commute.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {showForm && (
        <div className="px-5 mb-4 animate-fade-in-up">
          <div className="bg-white rounded-3xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-ink-900">New Subscription</h3>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
              <input
                type="text"
                value={subPickup}
                onChange={(e) => setSubPickup(e.target.value)}
                placeholder="Pickup (e.g. Mohan Nagar)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 outline-none text-sm font-medium text-ink-900 placeholder:text-ink-300"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-500" />
              <input
                type="text"
                value={subDest}
                onChange={(e) => setSubDest(e.target.value)}
                placeholder="Destination (e.g. ABS)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 outline-none text-sm font-medium text-ink-900 placeholder:text-ink-300"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="time"
                value={subTime}
                onChange={(e) => setSubTime(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 outline-none text-sm font-medium text-ink-900"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-700 mb-2">Days</p>
              <div className="flex gap-1.5">
                {days.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setSubDays(subDays.includes(i + 1) ? subDays.filter(d => d !== i + 1) : [...subDays, i + 1])}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      subDays.includes(i + 1) ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={!subPickup || !subDest}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-bold shadow-brand active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              Subscribe to Route
            </button>
          </div>
        </div>
      )}

      {/* Subscriptions */}
      <div className="px-5 mb-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Repeat className="w-3.5 h-3.5" /> Active Subscriptions
        </h3>
        {subscriptions.length > 0 ? (
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-ink-900">{sub.route_name}</h4>
                  <button
                    onClick={() => toggleSub(sub.id, sub.active)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${sub.active ? 'bg-brand-500' : 'bg-ink-200'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${sub.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{sub.departure_time}</span>
                  <span>·</span>
                  <span>{sub.days_of_week.length} days/week</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
            <Repeat className="w-5 h-5 text-ink-300" />
            <p className="text-sm text-ink-400">No subscriptions yet. Tap + to create one.</p>
          </div>
        )}
      </div>

      {/* Upcoming Scheduled Rides */}
      <div className="px-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Upcoming Rides
        </h3>
        {scheduledRides.length > 0 ? (
          <div className="space-y-2">
            {scheduledRides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-2xl p-4 shadow-card border-l-4 border-accent-400">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <div className="w-0.5 h-6 bg-ink-200" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-accent-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink-900">{ride.pickup_name}</p>
                    <p className="text-sm font-bold text-ink-900 mt-1">{ride.destination_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100 text-xs text-ink-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {ride.scheduled_at ? new Date(ride.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <CalendarDoodle className="w-28 h-20 opacity-50" />
            <p className="mt-3 text-sm text-ink-400 font-medium">Your commute calendar is empty.</p>
            <p className="text-xs text-ink-300 mt-1">Schedule a ride to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
