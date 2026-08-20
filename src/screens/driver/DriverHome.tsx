import { useState, useEffect } from 'react';
import { Power, IndianRupee, Car, Users, Calendar, Zap, TrendingUp, Sparkles, ChevronRight, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatINR, ROUTES } from '@/lib/constants';
import type { Driver, DriverMode, Ride } from '@/types';

interface DriverHomeProps {
  onModeChange: (mode: DriverMode) => void;
  onGoOnline: () => void;
}

export function DriverHome({ onModeChange, onGoOnline }: DriverHomeProps) {
  const { profile, driver } = useAuth();
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayRides, setTodayRides] = useState(0);
  const [incentiveEarned, setIncentiveEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    if (!driver) return;
    (async () => {
      const { data } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', driver.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      setRides((data as Ride[]) ?? []);

      const today = new Date().toISOString().split('T')[0];
      const todayRides = (data as Ride[])?.filter(r => r.created_at.startsWith(today)) ?? [];
      setTodayRides(todayRides.length);
      setTodayEarnings(todayRides.reduce((sum, r) => sum + r.driver_payout, 0));
    })();
  }, [driver]);

  const modes = [
    { id: 'private' as const, label: 'Private', desc: 'Full auto booking', icon: Car },
    { id: 'live_share' as const, label: 'Live Share', desc: 'Fill seats on your route', icon: Users },
    { id: 'scheduled' as const, label: 'Scheduled', desc: 'Predictable daily rides', icon: Calendar },
  ];

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const streakDays = [true, true, true, false, false, false, false];

  return (
    <div className="screen-container bg-ink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-ink-800 to-ink-900 px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-ink-400 text-sm">Good morning,</p>
            <h1 className="text-white text-2xl font-extrabold">{profile?.name?.split(' ')[0] ?? 'Driver'}!</h1>
          </div>
          <button
            onClick={onGoOnline}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all ${
              driver?.availability ? 'bg-brand-500 text-white' : 'bg-white/10 text-ink-300'
            }`}
          >
            <Power className={`w-4 h-4 ${driver?.availability ? 'fill-white' : ''}`} />
            {driver?.availability ? 'ONLINE' : 'OFFLINE'}
          </button>
        </div>

        {/* Earnings Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-ink-300 text-xs font-medium">Today's Earnings</p>
          <p className="text-white text-3xl font-extrabold mt-1">{formatINR(todayEarnings)}</p>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10">
            <div>
              <p className="text-ink-400 text-xs">Completed Rides</p>
              <p className="text-white font-bold text-lg">{todayRides}</p>
            </div>
            <div>
              <p className="text-ink-400 text-xs">Incentive Earned</p>
              <p className="text-white font-bold text-lg">{formatINR(incentiveEarned)}</p>
            </div>
            <div>
              <p className="text-ink-400 text-xs">Weekly Streak</p>
              <p className="text-white font-bold text-lg">{streak}/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="px-5 mt-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Select Mode</h3>
        <div className="grid grid-cols-3 gap-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = driver?.current_mode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  isActive ? 'border-brand-600 bg-brand-50' : 'border-ink-100 bg-white'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-1.5 ${isActive ? 'text-brand-600' : 'text-ink-400'}`} />
                <p className={`text-xs font-bold ${isActive ? 'text-brand-700' : 'text-ink-700'}`}>{mode.label}</p>
                <p className="text-[10px] text-ink-400 mt-0.5 leading-tight">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* RYDO Suggests */}
      <div className="px-5 mt-5">
        <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl p-5 shadow-accent">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white">RYDO Suggests</h3>
          </div>
          <p className="text-accent-50 text-sm">High shared demand near ABS from 5–7 PM.</p>
          <button
            onClick={() => onModeChange('live_share')}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-white text-accent-700 font-bold text-sm active:scale-95 transition-transform"
          >
            Switch to Sharing <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekly Streak */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-accent-500" />
            <h3 className="font-bold text-ink-900">Weekly Streak</h3>
            <span className="ml-auto text-sm font-bold text-brand-600">{streak}/7 days</span>
          </div>
          <div className="flex justify-between">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  streakDays[i] ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-300'
                }`}>
                  {streakDays[i] ? '✓' : day}
                </div>
                <span className="text-[10px] text-ink-400">{day}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-ink-100">
            <p className="text-xs text-ink-500">Complete 5 active days → <span className="font-bold text-brand-600">{formatINR(ROUTES.INCENTIVES.WEEKLY_STREAK_BONUS)} bonus</span></p>
          </div>
        </div>
      </div>

      {/* Recent Rides */}
      {rides.length > 0 && (
        <div className="px-5 mt-5">
          <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Recent Rides</h3>
          <div className="space-y-2">
            {rides.slice(0, 3).map((ride) => (
              <div key={ride.id} className="bg-white rounded-2xl p-3 shadow-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Car className="w-5 h-5 text-brand-600" />
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
