import { useState, useEffect } from 'react';
import { ArrowLeft, Users, IndianRupee, Clock, Check, MapPin, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { calculateFare, calculatePlatformFee, calculateDriverPayout, formatINR } from '@/lib/constants';
import { SearchingDoodle, SharedRideDoodle, SuccessDoodle } from '@/components/Doodles';
import type { Ride } from '@/types';

interface SharedBookingProps {
  pickup: string;
  destination: string;
  onBack: () => void;
  onComplete: () => void;
}

type Phase = 'searching' | 'found' | 'joining' | 'joined' | 'completed';

export function SharedBooking({ pickup, destination, onBack, onComplete }: SharedBookingProps) {
  const { profile } = useAuth();
  const [phase, setPhase] = useState<Phase>('searching');
  const [ride, setRide] = useState<Ride | null>(null);
  const [matchedPassengers, setMatchedPassengers] = useState(3);
  const [availableSeats, setAvailableSeats] = useState(1);

  const fareRange = calculateFare(pickup, destination, 'shared');
  const fareMin = fareRange;
  const fareMax = fareRange + 5;
  const platformFee = calculatePlatformFee(fareMin);
  const driverPayout = calculateDriverPayout(fareMin);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('found');
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  async function handleJoin() {
    setPhase('joining');

    // Check for existing shared rides on this route with available seats
    const { data: existingRides } = await supabase
      .from('rides')
      .select('*')
      .eq('ride_type', 'shared')
      .eq('pickup_name', pickup)
      .eq('destination_name', destination)
      .in('status', ['searching', 'driver_assigned'])
      .lt('filled_seats', 4)
      .order('created_at', { ascending: false })
      .limit(1);

    let targetRide: Ride;

    if (existingRides && existingRides.length > 0) {
      // Join existing ride
      targetRide = existingRides[0] as Ride;
      await supabase.from('rides').update({
        filled_seats: targetRide.filled_seats + 1,
      }).eq('id', targetRide.id);
    } else {
      // Create new shared ride
      const { data: newRide } = await supabase.from('rides').insert({
        ride_type: 'shared',
        pickup_name: pickup,
        destination_name: destination,
        passenger_id: profile?.id,
        status: 'searching',
        fare: fareMin,
        driver_payout: driverPayout,
        total_seats: 4,
        filled_seats: 1,
      }).select('*').single();
      targetRide = newRide as Ride;
    }

    setRide(targetRide);

    // Create booking
    if (profile) {
      await supabase.from('bookings').insert({
        ride_id: targetRide.id,
        passenger_id: profile.id,
        pickup_name: pickup,
        destination_name: destination,
        seats: 1,
        fare: fareMin,
        status: 'joined',
        payment_status: 'pending',
      });

      // Record demand data
      await supabase.from('demand_data').insert({
        route_name: `${pickup} → ${destination}`,
        pickup_name: pickup,
        destination_name: destination,
        expected_demand: matchedPassengers + 1,
        actual_demand: matchedPassengers + 1,
        available_drivers: 0,
        required_drivers: 1,
      });
    }

    setTimeout(() => setPhase('joined'), 2000);
    setTimeout(() => setPhase('completed'), 5000);
  }

  return (
    <div className="screen-container bg-ink-50 flex flex-col">
      <div className="px-5 pt-12 pb-4 bg-white border-b border-ink-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-ink-50">
            <ArrowLeft className="w-5 h-5 text-ink-700" />
          </button>
          <h1 className="text-lg font-bold text-ink-900">
            {phase === 'searching' && 'Finding your ride...'}
            {phase === 'found' && 'Shared Ride'}
            {phase === 'joining' && 'Joining ride...'}
            {phase === 'joined' && 'Ride Joined!'}
            {phase === 'completed' && 'Ride Completed'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Searching */}
        {phase === 'searching' && (
          <div className="flex flex-col items-center justify-center px-8 py-16 animate-fade-in">
            <SearchingDoodle className="w-40 h-32" />
            <h2 className="mt-6 text-xl font-bold text-ink-900">Finding your ride...</h2>
            <p className="mt-2 text-sm text-ink-500 text-center max-w-xs">
              Looking for passengers and drivers going your way.
            </p>
            <div className="mt-8 w-full max-w-xs space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-card">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-sm text-ink-600">Finding passengers on your route...</span>
                <div className="ml-auto w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-card">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-sm text-ink-600">Finding nearby drivers...</span>
                <div className="ml-auto w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-card">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-sm text-ink-600">Matching routes...</span>
                <div className="ml-auto w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              </div>
            </div>
            <button onClick={onBack} className="mt-8 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm">
              Cancel
            </button>
          </div>
        )}

        {/* Found */}
        {phase === 'found' && (
          <div className="px-5 py-6 space-y-4 animate-fade-in">
            <div className="flex justify-center mb-2">
              <SharedRideDoodle className="w-40 h-28" />
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
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

              <div className="flex items-center justify-between py-3 border-t border-ink-100">
                <span className="text-sm text-ink-500">Estimated fare</span>
                <span className="font-extrabold text-brand-600 text-lg">{formatINR(fareMin)}–{formatINR(fareMax)}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-accent-500" />
                <h3 className="font-bold text-ink-900">Passengers Matched</h3>
              </div>
              <p className="text-sm text-ink-600 mb-4">
                <span className="font-bold text-ink-900">{matchedPassengers} passengers</span> going your way.
                <span className="font-bold text-brand-600"> {availableSeats} seat available.</span>
              </p>

              <div className="flex items-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full ${i < matchedPassengers ? 'bg-brand-500' : 'bg-ink-100'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-2">{matchedPassengers}/4 seats filled</p>
            </div>

            <div className="bg-accent-50 rounded-3xl p-4 flex items-start gap-3 border border-accent-100">
              <Zap className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-accent-800">
                You'll share this ride with other passengers going the same way. Save more, travel together!
              </p>
            </div>

            <button
              onClick={handleJoin}
              className="w-full py-4 rounded-2xl bg-accent-500 text-white font-bold text-lg shadow-accent active:scale-[0.98] transition-transform"
            >
              Join Ride · {formatINR(fareMin)}
            </button>
          </div>
        )}

        {/* Joining */}
        {phase === 'joining' && (
          <div className="flex flex-col items-center justify-center px-8 py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            <h2 className="mt-6 text-xl font-bold text-ink-900">Joining ride...</h2>
            <p className="mt-2 text-sm text-ink-500">Securing your seat.</p>
          </div>
        )}

        {/* Joined */}
        {phase === 'joined' && (
          <div className="px-5 py-6 space-y-4 animate-fade-in">
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
                <Check className="w-10 h-10 text-brand-600" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-ink-900">Ride Joined!</h2>
              <p className="mt-1 text-sm text-ink-500">Your seat is confirmed.</p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
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
              <div className="flex items-center justify-between py-3 border-t border-ink-100">
                <span className="text-sm text-ink-500">Your fare</span>
                <span className="font-extrabold text-brand-600">{formatINR(fareMin)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-500">Status</span>
                <span className="px-2.5 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-bold">
                  Waiting for driver
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-ink-900">Co-passengers</h3>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: matchedPassengers }).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                    P{i + 1}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-ink-200 flex items-center justify-center text-xs text-ink-400">
                  +1
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed */}
        {phase === 'completed' && (
          <div className="flex flex-col items-center justify-center px-8 py-16 animate-fade-in">
            <SuccessDoodle className="w-40 h-32" />
            <h2 className="mt-6 text-2xl font-extrabold text-ink-900">You're all set!</h2>
            <p className="mt-2 text-sm text-ink-500 text-center max-w-xs">
              Your shared ride is confirmed. You'll be notified when the driver is assigned.
            </p>
            <button
              onClick={onComplete}
              className="mt-8 px-8 py-3.5 rounded-2xl bg-brand-600 text-white font-bold shadow-brand active:scale-[0.98] transition-transform"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
