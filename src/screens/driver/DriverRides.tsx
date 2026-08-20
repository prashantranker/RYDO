import { useState, useEffect } from 'react';
import { Clock, MapPin, IndianRupee, Check, X, Users, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/constants';
import { EmptyStateDoodle, SuccessDoodle } from '@/components/Doodles';
import type { Ride, Booking } from '@/types';

export function DriverRides() {
  const { driver } = useAuth();
  const [incomingRide, setIncomingRide] = useState<Ride | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);
  const [phase, setPhase] = useState<'idle' | 'incoming' | 'accepted' | 'completed'>('idle');

  useEffect(() => {
    if (!driver) return;
    (async () => {
      // Check for active ride
      const { data: active } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', driver.id)
        .in('status', ['driver_assigned', 'driver_arriving', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1);
      if (active && active.length > 0) {
        setActiveRide(active[0] as Ride);
        setPhase('accepted');
      }

      // Get completed rides
      const { data: completed } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', driver.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      setCompletedRides((completed as Ride[]) ?? []);

      // Simulate incoming ride after delay
      if (!active || active.length === 0) {
        setTimeout(() => {
          setIncomingRide({
            id: 'sim-incoming',
            ride_type: 'shared',
            pickup_name: 'ABS College',
            pickup_lat: null,
            pickup_lng: null,
            destination_name: 'Mohan Nagar',
            destination_lat: null,
            destination_lng: null,
            route: '',
            driver_id: null,
            passenger_id: null,
            status: 'searching',
            scheduled_at: null,
            fare: 30,
            driver_payout: 27,
            estimated_arrival_min: 5,
            total_seats: 4,
            filled_seats: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setPhase('incoming');
        }, 3000);
      }
    })();
  }, [driver]);

  async function acceptRide() {
    if (!incomingRide || !driver) return;
    const { data } = await supabase
      .from('rides')
      .update({ driver_id: driver.id, status: 'driver_assigned' })
      .eq('id', incomingRide.id)
      .select('*')
      .single();
    setActiveRide(data as Ride);
    setIncomingRide(null);
    setPhase('accepted');

    // Fetch bookings for this ride
    const { data: bk } = await supabase.from('bookings').select('*').eq('ride_id', incomingRide.id);
    setBookings((bk as Booking[]) ?? []);
  }

  async function startRide() {
    if (!activeRide) return;
    await supabase.from('rides').update({ status: 'in_progress' }).eq('id', activeRide.id);
    setActiveRide({ ...activeRide, status: 'in_progress' });
  }

  async function completeRide() {
    if (!activeRide || !driver) return;
    await supabase.from('rides').update({ status: 'completed' }).eq('id', activeRide.id);
    await supabase.from('ride_status_log').insert({
      ride_id: activeRide.id,
      status: 'completed',
      changed_by: driver.user_id,
    });
    setActiveRide(null);
    setPhase('completed');
    setTimeout(() => setPhase('idle'), 2500);
  }

  function rejectRide() {
    setIncomingRide(null);
    setPhase('idle');
  }

  return (
    <div className="screen-container bg-ink-50 pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900">Rides</h1>
      </div>

      {/* Incoming Ride */}
      {phase === 'incoming' && incomingRide && (
        <div className="px-5 animate-fade-in-up">
          <div className="bg-white rounded-3xl p-5 shadow-float border-2 border-brand-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-sm font-bold text-brand-600">New Ride Request!</span>
            </div>
            <div className="flex items-start gap-3 mb-4">
              <div className="flex flex-col items-center pt-1">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <div className="w-0.5 h-10 bg-ink-200" />
                <div className="w-3 h-3 rounded-sm bg-accent-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-ink-900">{incomingRide.pickup_name}</p>
                <p className="font-bold text-ink-900 mt-3">{incomingRide.destination_name}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4 py-3 border-t border-ink-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-ink-400" />
                <span className="text-sm font-semibold text-ink-700">{incomingRide.filled_seats} passengers</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-400">Your payout</p>
                <p className="font-extrabold text-brand-600 text-lg">{formatINR(incomingRide.driver_payout)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={rejectRide}
                className="flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" /> Reject
              </button>
              <button
                onClick={acceptRide}
                className="flex-1 py-3.5 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center gap-2 shadow-brand active:scale-95 transition-transform"
              >
                <Check className="w-5 h-5" /> Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Ride */}
      {phase === 'accepted' && activeRide && (
        <div className="px-5 animate-fade-in space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase">
                {activeRide.status === 'in_progress' ? 'In Progress' : 'Assigned'}
              </span>
              <span className="text-sm font-bold text-brand-600">{formatINR(activeRide.driver_payout)}</span>
            </div>
            <div className="flex items-start gap-3 mb-4">
              <div className="flex flex-col items-center pt-1">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <div className="w-0.5 h-10 bg-ink-200" />
                <div className="w-3 h-3 rounded-sm bg-accent-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-ink-900">{activeRide.pickup_name}</p>
                <p className="font-bold text-ink-900 mt-3">{activeRide.destination_name}</p>
              </div>
            </div>
            {bookings.length > 0 && (
              <div className="pt-3 border-t border-ink-100">
                <p className="text-xs font-bold text-ink-400 uppercase mb-2">Passengers ({bookings.length})</p>
                <div className="flex items-center gap-2">
                  {bookings.map((b, i) => (
                    <div key={b.id} className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                      P{i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeRide.status === 'driver_assigned' ? (
              <button
                onClick={startRide}
                className="w-full mt-4 py-3.5 rounded-xl bg-brand-600 text-white font-bold shadow-brand active:scale-[0.98] transition-transform"
              >
                Start Ride
              </button>
            ) : (
              <button
                onClick={completeRide}
                className="w-full mt-4 py-3.5 rounded-xl bg-brand-600 text-white font-bold shadow-brand active:scale-[0.98] transition-transform"
              >
                Complete Ride
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed */}
      {phase === 'completed' && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <SuccessDoodle className="w-32 h-24" />
          <h2 className="mt-4 text-xl font-bold text-ink-900">Ride Completed!</h2>
          <p className="mt-1 text-sm text-ink-500">Earnings added to your wallet.</p>
        </div>
      )}

      {/* Idle / Waiting */}
      {phase === 'idle' && !incomingRide && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-ink-500 font-medium">Waiting for ride requests...</p>
          <p className="text-xs text-ink-400 mt-1">Make sure you're online to receive rides.</p>
        </div>
      )}

      {/* Ride History */}
      {completedRides.length > 0 && (
        <div className="px-5 mt-6">
          <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Ride History</h3>
          <div className="space-y-2">
            {completedRides.slice(0, 5).map((ride) => (
              <div key={ride.id} className="bg-white rounded-2xl p-3 shadow-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900">{ride.pickup_name} → {ride.destination_name}</p>
                  <p className="text-xs text-ink-400">{new Date(ride.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <p className="font-bold text-brand-600">{formatINR(ride.driver_payout)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
