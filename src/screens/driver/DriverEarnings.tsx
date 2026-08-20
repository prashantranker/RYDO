import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Calendar, Flame, Award, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatINR, ROUTES } from '@/lib/constants';
import type { Ride, Incentive } from '@/types';

export function DriverEarnings() {
  const { driver } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [tab, setTab] = useState<'today' | 'week' | 'incentives'>('today');

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

      const { data: inc } = await supabase
        .from('incentives')
        .select('*')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false });
      setIncentives((inc as Incentive[]) ?? []);
    })();
  }, [driver]);

  const today = new Date().toISOString().split('T')[0];
  const todayRides = rides.filter(r => r.created_at.startsWith(today));
  const todayEarnings = todayRides.reduce((sum, r) => sum + r.driver_payout, 0);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekRides = rides.filter(r => r.created_at >= weekAgo);
  const weekEarnings = weekRides.reduce((sum, r) => sum + r.driver_payout, 0);

  const totalIncentives = incentives.filter(i => i.status === 'earned' || i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

  const dailyTarget = ROUTES.INCENTIVES.DAILY_RIDE_TARGET;
  const dailyProgress = Math.min(todayRides.length, dailyTarget);

  return (
    <div className="screen-container bg-ink-50 pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900">Earnings</h1>
      </div>

      <div className="px-5 mb-4">
        <div className="flex gap-2 p-1 rounded-2xl bg-ink-100">
          {[
            { id: 'today' as const, label: 'Today' },
            { id: 'week' as const, label: 'This Week' },
            { id: 'incentives' as const, label: 'Incentives' },
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

      {tab === 'today' && (
        <div className="px-5 space-y-4 animate-fade-in">
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-6 shadow-brand">
            <p className="text-brand-100 text-sm">Today's Earnings</p>
            <p className="text-white text-4xl font-extrabold mt-1">{formatINR(todayEarnings)}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-brand-100 text-xs">Rides</p>
                <p className="text-white font-bold text-lg">{todayRides.length}</p>
              </div>
              <div>
                <p className="text-brand-100 text-xs">Avg / Ride</p>
                <p className="text-white font-bold text-lg">{todayRides.length > 0 ? formatINR(todayEarnings / todayRides.length) : '₹0'}</p>
              </div>
            </div>
          </div>

          {/* Daily Incentive Progress */}
          <div className="bg-white rounded-3xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-accent-500" />
              <h3 className="font-bold text-ink-900">Daily Incentive</h3>
            </div>
            <p className="text-sm text-ink-500 mb-3">Complete {dailyTarget} rides → unlock bonus eligibility</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-3 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all" style={{ width: `${(dailyProgress / dailyTarget) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-ink-700">{dailyProgress}/{dailyTarget}</span>
            </div>
            {dailyProgress >= dailyTarget ? (
              <p className="text-sm text-brand-600 font-semibold mt-2">Bonus unlocked! Ride {dailyProgress + 1}+ for extra {formatINR(ROUTES.INCENTIVES.DAILY_BONUS_PER_RIDE)}/ride</p>
            ) : (
              <p className="text-xs text-ink-400 mt-2">{dailyTarget - dailyProgress} more rides to unlock bonus</p>
            )}
          </div>

          {/* Today's Rides */}
          {todayRides.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider">Today's Rides</h3>
              {todayRides.map((ride) => (
                <div key={ride.id} className="bg-white rounded-2xl p-3 shadow-card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-900">{ride.pickup_name} → {ride.destination_name}</p>
                    <p className="text-xs text-ink-400">{new Date(ride.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p className="font-bold text-brand-600">{formatINR(ride.driver_payout)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-ink-400">No rides completed today yet.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'week' && (
        <div className="px-5 space-y-4 animate-fade-in">
          <div className="bg-gradient-to-br from-ink-800 to-ink-900 rounded-3xl p-6 shadow-card">
            <p className="text-ink-400 text-sm">This Week's Earnings</p>
            <p className="text-white text-4xl font-extrabold mt-1">{formatINR(weekEarnings)}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-ink-400 text-xs">Total Rides</p>
                <p className="text-white font-bold text-lg">{weekRides.length}</p>
              </div>
              <div>
                <p className="text-ink-400 text-xs">Avg / Day</p>
                <p className="text-white font-bold text-lg">{weekRides.length > 0 ? formatINR(weekEarnings / 7) : '₹0'}</p>
              </div>
            </div>
          </div>

          {/* Weekly Streak */}
          <div className="bg-white rounded-3xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-accent-500" />
              <h3 className="font-bold text-ink-900">Weekly Streak</h3>
            </div>
            <p className="text-sm text-ink-500 mb-3">Complete 5 active days → {formatINR(ROUTES.INCENTIVES.WEEKLY_STREAK_BONUS)} bonus</p>
            <div className="flex justify-between">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-300'}`}>
                    {i < 3 ? '✓' : ''}
                  </div>
                  <span className="text-[10px] text-ink-400">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {weekRides.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider">Recent Rides</h3>
              {weekRides.slice(0, 5).map((ride) => (
                <div key={ride.id} className="bg-white rounded-2xl p-3 shadow-card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-900">{ride.pickup_name} → {ride.destination_name}</p>
                    <p className="text-xs text-ink-400">{new Date(ride.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <p className="font-bold text-brand-600">{formatINR(ride.driver_payout)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'incentives' && (
        <div className="px-5 space-y-4 animate-fade-in">
          <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl p-6 shadow-accent">
            <p className="text-accent-50 text-sm">Total Incentives Earned</p>
            <p className="text-white text-4xl font-extrabold mt-1">{formatINR(totalIncentives)}</p>
          </div>

          {/* Available Incentives */}
          <div className="bg-white rounded-3xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-accent-500" />
              <h3 className="font-bold text-ink-900">Available Incentives</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-accent-50 border border-accent-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-ink-900 text-sm">Daily Ride Bonus</p>
                    <p className="text-xs text-ink-500">Complete 20 rides, earn {formatINR(ROUTES.INCENTIVES.DAILY_BONUS_PER_RIDE)}/ride after</p>
                  </div>
                  <span className="text-xs font-bold text-accent-600 px-2 py-1 rounded-full bg-accent-100">Active</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-brand-50 border border-brand-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-ink-900 text-sm">Weekly Streak</p>
                    <p className="text-xs text-ink-500">5 active days → {formatINR(ROUTES.INCENTIVES.WEEKLY_STREAK_BONUS)} bonus</p>
                  </div>
                  <span className="text-xs font-bold text-brand-600 px-2 py-1 rounded-full bg-brand-100">3/5</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-ink-900 text-sm">Peak Demand Bonus</p>
                    <p className="text-xs text-ink-500">Extra {formatINR(ROUTES.INCENTIVES.PEAK_DEMAND_BONUS)} for ABS → Mohan Nagar 5-7PM</p>
                  </div>
                  <span className="text-xs font-bold text-red-500 px-2 py-1 rounded-full bg-red-100">Hot</span>
                </div>
              </div>
            </div>
          </div>

          {incentives.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider">Earned Incentives</h3>
              {incentives.map((inc) => (
                <div key={inc.id} className="bg-white rounded-2xl p-3 shadow-card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
                    <Award className="w-5 h-5 text-accent-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-900 capitalize">{inc.incentive_type.replace('_', ' ')}</p>
                    <p className="text-xs text-ink-400">{inc.criteria}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-600">{formatINR(inc.amount)}</p>
                    <span className="text-xs text-ink-400 capitalize">{inc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
