import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Users, MapPin, Zap, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/lib/constants';
import type { DemandData } from '@/types';

export function DriverDemand() {
  const [demandData, setDemandData] = useState<DemandData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('demand_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setDemandData((data as DemandData[]) ?? []);
      setLoading(false);
    })();
  }, []);

  // Use sample data if no real demand data yet
  const sampleDemand = [
    { location: 'ABS College', level: 'high', passengers: 30, requiredAutos: 8, available: 7, additionalNeeded: 1 },
    { location: 'Sector 62', level: 'very_high', passengers: 45, requiredAutos: 12, available: 8, additionalNeeded: 4 },
    { location: 'Mohan Nagar', level: 'medium', passengers: 18, requiredAutos: 5, available: 5, additionalNeeded: 0 },
    { location: 'Lal Kuan', level: 'medium', passengers: 15, requiredAutos: 4, available: 3, additionalNeeded: 1 },
    { location: 'Vaishali', level: 'low', passengers: 8, requiredAutos: 2, available: 4, additionalNeeded: 0 },
  ];

  const levelConfig: Record<string, { label: string; color: string; bg: string; dots: number }> = {
    very_high: { label: 'Very High', color: 'text-red-600', bg: 'bg-red-50 border-red-200', dots: 4 },
    high: { label: 'High', color: 'text-accent-600', bg: 'bg-accent-50 border-accent-200', dots: 3 },
    medium: { label: 'Medium', color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200', dots: 2 },
    low: { label: 'Low', color: 'text-ink-500', bg: 'bg-ink-50 border-ink-100', dots: 1 },
  };

  return (
    <div className="screen-container bg-ink-50 pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900">Nearby Demand</h1>
        <p className="text-sm text-ink-500">Smart allocation based on real demand.</p>
      </div>

      {/* Heatmap Visualization */}
      <div className="px-5 mb-5">
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-accent-500" />
            <h3 className="font-bold text-ink-900">Demand Heatmap</h3>
          </div>
          <div className="space-y-3">
            {sampleDemand.map((item, i) => {
              const config = levelConfig[item.level];
              return (
                <div key={i} className={`p-3 rounded-2xl border ${config.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${config.color}`} />
                      <span className="font-bold text-ink-900 text-sm">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <Flame
                          key={idx}
                          className={`w-3.5 h-3.5 ${idx < config.dots ? 'fill-accent-400 text-accent-400' : 'text-ink-200'}`}
                        />
                      ))}
                      <span className={`ml-1 text-xs font-bold ${config.color}`}>{config.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-500">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {item.passengers} passengers</span>
                    <span>·</span>
                    <span>{item.requiredAutos} autos needed</span>
                    <span>·</span>
                    <span>{item.available} available</span>
                  </div>
                  {item.additionalNeeded > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/80 text-xs font-semibold text-accent-700">
                        {item.additionalNeeded} more driver{item.additionalNeeded > 1 ? 's' : ''} needed
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-accent-500 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform">
                        Go <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Demand Calculation */}
      <div className="px-5 mb-5">
        <div className="bg-gradient-to-br from-ink-800 to-ink-900 rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-white">How RYDO Calculates Demand</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-ink-300">Expected passengers</span>
              <span className="text-white font-bold">30</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-ink-300">Required autos</span>
              <span className="text-white font-bold">8</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-ink-300">Already available</span>
              <span className="text-white font-bold">7</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-brand-400 font-semibold">Additional drivers required</span>
              <span className="text-brand-400 font-extrabold text-lg">1</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Only the required number of drivers receive priority notifications — not every driver.
          </p>
        </div>
      </div>

      {/* Scheduled Demand */}
      <div className="px-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Tomorrow's Scheduled Demand
        </h3>
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-ink-900">Mohan Nagar → ABS</p>
              <p className="text-xs text-ink-400">Tomorrow · 9:00 AM</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-400">Expected passengers</p>
              <p className="font-extrabold text-brand-600 text-lg">18</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-500 pt-3 border-t border-ink-100">
            <span>Required autos: <span className="font-bold text-ink-700">5</span></span>
            <span>·</span>
            <span>Estimated payout: <span className="font-bold text-brand-600">₹135/ride</span></span>
            <span>·</span>
            <span>Duration: <span className="font-bold text-ink-700">~25 min</span></span>
          </div>
          <button className="w-full mt-3 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-brand active:scale-[0.98] transition-transform">
            Accept Scheduled Ride
          </button>
        </div>
      </div>
    </div>
  );
}
