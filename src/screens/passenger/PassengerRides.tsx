import { useState, useEffect } from 'react';
import { Clock, MapPin, IndianRupee, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/constants';
import { EmptyStateDoodle } from '@/components/Doodles';
import type { Ride, Subscription } from '@/types';

export function PassengerRides() {
  const { profile } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tab, setTab] = useState<'history' | 'scheduled' | 'subscriptions'>('history');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: rideData } = await supabase
        .from('rides')
        .select('*')
        .eq('passenger_id', profile.id)
        .order('created_at', { ascending: false });
      setRides((rideData as Ride[]) ?? []);

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('passenger_id', profile.id)
        .order('created_at', { ascending: false });
      setSubscriptions((subData as Subscription[]) ?? []);

      setLoading(false);
    })();
  }, [profile]);

  const completedRides = rides.filter(r => r.status === 'completed');
  const upcomingRides = rides.filter(r => r.status === 'searching' || r.status === 'driver_assigned' || r.scheduled_at);

  return (
    <div className="screen-container bg-ink-50 pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900">My Rides</h1>
      </div>

      <div className="px-5 mb-4">
        <div className="flex gap-2 p-1 rounded-2xl bg-ink-100">
          {[
            { id: 'history' as const, label: 'History' },
            { id: 'scheduled' as const, label: 'Upcoming' },
            { id: 'subscriptions' as const, label: 'Subscriptions' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id ? 'bg-white text-brand-600 shadow-soft' : 'text-ink-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-5 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl shimmer-bg" />
          ))}
        </div>
      ) : (
        <div className="px-5 space-y-3">
          {tab === 'history' && (
            completedRides.length > 0 ? (
              completedRides.map((ride) => (
                <div key={ride.id} className="bg-white rounded-2xl p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                      <div className="w-0.5 h-8 bg-ink-200" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-accent-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{ride.pickup_name}</p>
                      <p className="text-sm font-bold text-ink-900 mt-2">{ride.destination_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-brand-600">{formatINR(ride.fare)}</p>
                      <p className="text-xs text-ink-400 capitalize">{ride.ride_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100 text-xs text-ink-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(ride.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-semibold">Completed</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No rides yet" desc="Your ride history will appear here." />
            )
          )}

          {tab === 'scheduled' && (
            upcomingRides.length > 0 ? (
              upcomingRides.filter(r => r.scheduled_at).map((ride) => (
                <div key={ride.id} className="bg-white rounded-2xl p-4 shadow-card border-l-4 border-accent-400">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                      <div className="w-0.5 h-8 bg-ink-200" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-accent-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{ride.pickup_name}</p>
                      <p className="text-sm font-bold text-ink-900 mt-2">{ride.destination_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100 text-xs text-ink-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {ride.scheduled_at ? new Date(ride.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-accent-50 text-accent-600 font-semibold">Scheduled</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Your commute calendar is empty" desc="Schedule a ride for your daily commute." />
            )
          )}

          {tab === 'subscriptions' && (
            subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-2xl p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-ink-900">{sub.route_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sub.active ? 'bg-brand-50 text-brand-600' : 'bg-ink-100 text-ink-400'}`}>
                      {sub.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                      <div className="w-0.5 h-6 bg-ink-200" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-accent-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-700">{sub.pickup_name}</p>
                      <p className="text-sm font-semibold text-ink-700 mt-1">{sub.destination_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-ink-100 text-xs text-ink-400">
                    <Clock className="w-3.5 h-3.5" />
                    {sub.departure_time} · {sub.days_of_week.length} days/week
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No subscriptions" desc="Subscribe to a route for your daily commute." />
            )
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <EmptyStateDoodle className="w-32 h-24" />
      <h3 className="mt-4 font-bold text-ink-700">{title}</h3>
      <p className="mt-1 text-sm text-ink-400 text-center max-w-xs">{desc}</p>
    </div>
  );
}
