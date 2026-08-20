import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, IndianRupee, Clock, Star, Phone, MessageCircle, Shield, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { calculateFare, calculatePlatformFee, calculateDriverPayout, formatINR, ROUTES } from '@/lib/constants';
import { SearchingDoodle, SuccessDoodle, AutoRickshawDoodle } from '@/components/Doodles';
import type { Ride, Driver, Vehicle, Profile } from '@/types';

interface PrivateBookingProps {
  pickup: string;
  destination: string;
  onBack: () => void;
  onComplete: () => void;
}

type Phase = 'summary' | 'searching' | 'driver_found' | 'arriving' | 'in_progress' | 'payment' | 'rating' | 'completed';

export function PrivateBooking({ pickup, destination, onBack, onComplete }: PrivateBookingProps) {
  const { profile } = useAuth();
  const [phase, setPhase] = useState<Phase>('summary');
  const [ride, setRide] = useState<Ride | null>(null);
  const [driver, setDriver] = useState<(Driver & { profile?: Profile }) | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const fare = calculateFare(pickup, destination, 'private');
  const platformFee = calculatePlatformFee(fare);
  const driverPayout = calculateDriverPayout(fare);
  const eta = Math.floor(Math.random() * 8) + 3;

  async function handleConfirm() {
    setPhase('searching');

    // Create ride record
    const { data: newRide } = await supabase.from('rides').insert({
      ride_type: 'private',
      pickup_name: pickup,
      destination_name: destination,
      passenger_id: profile?.id,
      status: 'searching',
      fare,
      driver_payout: driverPayout,
      estimated_arrival_min: eta,
      total_seats: 1,
      filled_seats: 1,
    }).select('*').single();

    if (newRide) setRide(newRide as Ride);

    // Simulate driver matching
    setTimeout(async () => {
      // Find an available driver
      const { data: drivers } = await supabase
        .from('drivers')
        .select('*, profiles!inner(*)')
        .eq('availability', true)
        .in('verification_status', ['verified', 'active'])
        .limit(1);

      if (drivers && drivers.length > 0) {
        const matchedDriver = drivers[0] as Driver & { profiles: Profile };
        setDriver(matchedDriver);

        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .eq('driver_id', matchedDriver.id)
          .limit(1);

        if (vehicles && vehicles.length > 0) setVehicle(vehicles[0] as Vehicle);

        if (newRide) {
          await supabase.from('rides').update({
            driver_id: matchedDriver.id,
            status: 'driver_assigned',
          }).eq('id', newRide.id);

          await supabase.from('ride_status_log').insert({
            ride_id: newRide.id,
            status: 'driver_assigned',
            changed_by: profile?.id,
          });
        }

        setPhase('driver_found');
        setTimeout(() => setPhase('arriving'), 2000);
        setTimeout(() => setPhase('in_progress'), 5000);
        setTimeout(() => setPhase('payment'), 8000);
      } else {
        // No driver found — simulate with mock data for demo
        const mockDriver = {
          id: 'mock-driver',
          user_id: 'mock',
          verification_status: 'active' as const,
          licence_status: 'verified',
          rating: 4.7,
          total_ratings: 234,
          availability: true,
          current_mode: 'private' as const,
          upi_id: '',
          bank_account: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile: {
            id: 'mock',
            role: 'driver' as const,
            name: 'Ramesh Kumar',
            phone: '98XXXXXXXX',
            email: '',
            profile_image: '',
            preferred_commute_type: 'both' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
        setDriver(mockDriver);
        setVehicle({
          id: 'mock-vehicle',
          driver_id: 'mock-driver',
          type: 'auto' as const,
          registration_number: 'UP 32 AB 1234',
          capacity: 4,
          verification_status: 'verified',
          vehicle_photo: '',
          created_at: new Date().toISOString(),
        });

        if (newRide) {
          await supabase.from('ride_status_log').insert({
            ride_id: newRide.id,
            status: 'driver_assigned',
            changed_by: profile?.id,
          });
        }

        setPhase('driver_found');
        setTimeout(() => setPhase('arriving'), 2000);
        setTimeout(() => setPhase('in_progress'), 5000);
        setTimeout(() => setPhase('payment'), 8000);
      }
    }, 3000);
  }

  async function handlePayment() {
    if (ride && profile) {
      await supabase.from('payments').insert({
        ride_id: ride.id,
        passenger_id: profile.id,
        driver_id: ride.driver_id,
        amount: fare,
        platform_fee: platformFee,
        driver_payout: driverPayout,
        payment_status: 'paid',
        payment_method: 'upi',
      });

      await supabase.from('rides').update({ status: 'completed' }).eq('id', ride.id);
      await supabase.from('ride_status_log').insert({
        ride_id: ride.id,
        status: 'completed',
        changed_by: profile.id,
      });
    }
    setPhase('rating');
  }

  async function handleRating() {
    if (ride && profile && driver) {
      await supabase.from('ratings').insert({
        ride_id: ride.id,
        rater_id: profile.id,
        ratee_id: driver.user_id,
        rater_role: 'passenger',
        stars: rating,
        feedback,
      });
    }
    setPhase('completed');
    setTimeout(() => onComplete(), 2000);
  }

  async function handleCancel() {
    if (ride) {
      await supabase.from('rides').update({ status: 'cancelled' }).eq('id', ride.id);
    }
    onBack();
  }

  return (
    <div className="screen-container bg-ink-50 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white border-b border-ink-100">
        <div className="flex items-center gap-3">
          {phase !== 'completed' && (
            <button onClick={phase === 'searching' ? handleCancel : onBack} className="p-2 -ml-2 rounded-xl hover:bg-ink-50">
              <ArrowLeft className="w-5 h-5 text-ink-700" />
            </button>
          )}
          <h1 className="text-lg font-bold text-ink-900">
            {phase === 'summary' && 'Ride Summary'}
            {phase === 'searching' && 'Finding your driver...'}
            {(phase === 'driver_found' || phase === 'arriving') && 'Driver Assigned'}
            {phase === 'in_progress' && 'Ride in Progress'}
            {phase === 'payment' && 'Payment'}
            {phase === 'rating' && 'Rate your ride'}
            {phase === 'completed' && 'Ride Completed'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Summary Phase */}
        {phase === 'summary' && (
          <div className="px-5 py-6 space-y-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-brand-500" />
                  <div className="w-0.5 h-12 bg-ink-200" />
                  <div className="w-3 h-3 rounded-sm bg-accent-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-ink-400 font-semibold uppercase">Pickup</p>
                    <p className="text-base font-bold text-ink-900">{pickup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400 font-semibold uppercase">Destination</p>
                    <p className="text-base font-bold text-ink-900">{destination}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-ink-700 mb-3">Fare Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-500 text-sm">Ride fare</span>
                  <span className="font-semibold text-ink-900">{formatINR(fare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500 text-sm">Platform fee</span>
                  <span className="font-semibold text-ink-900">{formatINR(platformFee)}</span>
                </div>
                <div className="border-t border-ink-100 pt-2 flex justify-between">
                  <span className="font-bold text-ink-900">Total</span>
                  <span className="font-extrabold text-brand-600 text-lg">{formatINR(fare)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-500" />
              <span className="text-sm text-ink-600">Estimated arrival: <span className="font-bold text-ink-900">{eta} min</span></span>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform"
            >
              Confirm Private Ride
            </button>
          </div>
        )}

        {/* Searching Phase */}
        {phase === 'searching' && (
          <div className="flex flex-col items-center justify-center px-8 py-16 animate-fade-in">
            <SearchingDoodle className="w-40 h-32" />
            <h2 className="mt-6 text-xl font-bold text-ink-900">Finding your driver...</h2>
            <p className="mt-2 text-sm text-ink-500 text-center max-w-xs">
              Looking for drivers near {pickup} going towards {destination}.
            </p>
            <div className="mt-6 flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <button onClick={handleCancel} className="mt-8 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm">
              Cancel Search
            </button>
          </div>
        )}

        {/* Driver Found / Arriving / In Progress */}
        {(phase === 'driver_found' || phase === 'arriving' || phase === 'in_progress') && driver && (
          <div className="px-5 py-6 space-y-4 animate-fade-in">
            {/* Map placeholder */}
            <div className="relative h-48 rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden flex items-center justify-center">
              <AutoRickshawDoodle className="w-32 h-24 animate-bounce-subtle" />
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white shadow-card text-xs font-bold text-brand-600">
                {phase === 'driver_found' && 'Driver Assigned'}
                {phase === 'arriving' && `Arriving in ${eta} min`}
                {phase === 'in_progress' && 'On the way!'}
              </div>
            </div>

            {/* Driver Card */}
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
                  {driver.profile?.name?.[0] ?? 'D'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-ink-900 text-lg">{driver.profile?.name ?? 'Driver'}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
                    <span className="text-sm font-semibold text-ink-700">{driver.rating.toFixed(1)}</span>
                    <span className="text-xs text-ink-400">({driver.total_ratings} rides)</span>
                  </div>
                </div>
              </div>

              {vehicle && (
                <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-ink-400 font-semibold uppercase">Vehicle</p>
                    <p className="font-bold text-ink-900">{vehicle.type === 'auto' ? 'Auto Rickshaw' : 'E-Rickshaw'}</p>
                    <p className="text-sm text-ink-500">{vehicle.registration_number}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-ink-100 font-bold text-ink-700 text-sm">
                    {vehicle.registration_number}
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-50 text-brand-700 font-semibold text-sm">
                  <Phone className="w-4 h-4" /> Call
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-ink-100 text-ink-700 font-semibold text-sm">
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
              </div>
            </div>

            {/* Ride Info */}
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-brand-500" />
                  <div className="w-0.5 h-8 bg-ink-200" />
                  <div className="w-3 h-3 rounded-sm bg-accent-500" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-ink-900">{pickup}</p>
                  <p className="font-semibold text-ink-900 mt-3">{destination}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-ink-100">
                <span className="text-sm text-ink-500">Fare</span>
                <span className="font-extrabold text-brand-600">{formatINR(fare)}</span>
              </div>
            </div>

            {/* SOS */}
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-sm border border-red-100">
              <Shield className="w-4 h-4" /> Emergency SOS
            </button>
          </div>
        )}

        {/* Payment Phase */}
        {phase === 'payment' && (
          <div className="px-5 py-6 space-y-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <h3 className="font-bold text-ink-900 mb-4">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-500 text-sm">Ride fare</span>
                  <span className="font-semibold text-ink-900">{formatINR(fare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500 text-sm">Platform fee</span>
                  <span className="font-semibold text-ink-900">{formatINR(platformFee)}</span>
                </div>
                <div className="border-t border-ink-100 pt-2 flex justify-between">
                  <span className="font-bold text-ink-900">Total</span>
                  <span className="font-extrabold text-brand-600 text-lg">{formatINR(fare)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <h3 className="font-bold text-ink-900 mb-3">Payment Method</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-brand-600 bg-brand-50">
                  <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink-900">UPI</p>
                    <p className="text-xs text-ink-500">Pay via any UPI app</p>
                  </div>
                  <Check className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-ink-100">
                  <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-ink-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink-900">Cash</p>
                    <p className="text-xs text-ink-500">Pay driver directly</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform"
            >
              Pay {formatINR(fare)}
            </button>
          </div>
        )}

        {/* Rating Phase */}
        {phase === 'rating' && (
          <div className="px-5 py-6 space-y-4 animate-fade-in">
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-3xl font-bold text-brand-700 mb-4">
                {driver?.profile?.name?.[0] ?? 'D'}
              </div>
              <h3 className="font-bold text-ink-900 text-lg">{driver?.profile?.name ?? 'Your Driver'}</h3>
              <p className="text-sm text-ink-500 mt-1">How was your ride?</p>
            </div>

            <div className="flex justify-center gap-3 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star className={`w-10 h-10 transition-all ${star <= rating ? 'fill-accent-400 text-accent-400 scale-110' : 'text-ink-200'}`} />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <div className="animate-fade-in space-y-3">
                <div className="bg-white rounded-3xl p-4 shadow-card">
                  <div className="flex flex-wrap gap-2">
                    {['Safe driving', 'Friendly', 'On time', 'Clean vehicle', 'Good route'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setFeedback(feedback ? `${feedback}, ${tag}` : tag)}
                        className="px-3 py-1.5 rounded-full bg-ink-50 border border-ink-100 text-xs font-semibold text-ink-700 hover:border-brand-300 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleRating}
                  className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform"
                >
                  Submit Rating
                </button>
              </div>
            )}
          </div>
        )}

        {/* Completed Phase */}
        {phase === 'completed' && (
          <div className="flex flex-col items-center justify-center px-8 py-16 animate-fade-in">
            <SuccessDoodle className="w-40 h-32" />
            <h2 className="mt-6 text-2xl font-extrabold text-ink-900">Ride Completed!</h2>
            <p className="mt-2 text-sm text-ink-500 text-center">Thank you for riding with RYDO. Ride Milegi, Saath Bhi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
