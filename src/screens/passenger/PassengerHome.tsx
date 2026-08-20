import { useState } from 'react';
import { Search, MapPin, Navigation, Calendar, Clock, Zap, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
import { MetroDoodle } from '@/components/Doodles';

interface PassengerHomeProps {
  onBookPrivate: (pickup: string, destination: string) => void;
  onBookShared: (pickup: string, destination: string) => void;
  onSchedule: (data: { pickup: string; destination: string; date: string; time: string }) => void;
}

export function PassengerHome({ onBookPrivate, onBookShared, onSchedule }: PassengerHomeProps) {
  const { profile } = useAuth();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const popularRoutes = ROUTES.COLLEGE_CORRIDORS.slice(0, 4);

  return (
    <div className="screen-container bg-ink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-600 to-brand-700 px-5 pt-12 pb-20 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-brand-100 text-sm font-medium">Namaste, {profile?.name?.split(' ')[0] || 'there'}!</p>
            <h1 className="text-white text-2xl font-extrabold">Kahan jaana hai?</h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
            {profile?.name?.[0]?.toUpperCase() || 'P'}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-float">
          <div className="flex items-center gap-2 px-2">
            <Navigation className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <span className="text-sm text-ink-600 font-medium truncate">Current Location</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 -mt-10">
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow" />
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Pickup location"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300 text-sm font-medium"
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-sm bg-accent-500 border-2 border-white shadow" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Search destination"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="px-5 mt-5">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Popular Routes</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {popularRoutes.map((route, i) => (
            <button
              key={i}
              onClick={() => { setPickup(route.pickup); setDestination(route.destination); }}
              className="flex-shrink-0 px-3 py-2 rounded-xl bg-white border border-ink-100 text-xs font-semibold text-ink-700 hover:border-brand-300 transition-all"
            >
              {route.pickup} → {route.destination}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Cards */}
      <div className="px-5 mt-5 space-y-4">
        {/* Private Auto */}
        <button
          onClick={() => onBookPrivate(pickup || 'Current Location', destination)}
          disabled={!destination}
          className="w-full text-left p-5 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-brand active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <span className="text-3xl">🛺</span>
            </div>
            {destination && (
              <div className="text-right">
                <p className="text-brand-100 text-xs font-medium">Est. fare</p>
                <p className="text-white text-xl font-extrabold">
                  ₹{ROUTES.COLLEGE_CORRIDORS.find(r => r.pickup === pickup && r.destination === destination)?.fare.private ?? '120'}
                </p>
              </div>
            )}
          </div>
          <h3 className="text-white text-xl font-extrabold">Private Auto</h3>
          <p className="text-brand-100 text-sm font-medium">Your ride. Your space.</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-brand-100">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Direct ride</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> No sharing</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-white font-bold">Book Private</span>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-brand-600" />
            </div>
          </div>
        </button>

        {/* Live Sharing */}
        <button
          onClick={() => onBookShared(pickup || 'Current Location', destination)}
          disabled={!destination}
          className="w-full text-left p-5 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-accent active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <span className="text-3xl">👥</span>
            </div>
            {destination && (
              <div className="text-right">
                <p className="text-accent-100 text-xs font-medium">Est. fare</p>
                <p className="text-white text-xl font-extrabold">
                  ₹{ROUTES.COLLEGE_CORRIDORS.find(r => r.pickup === pickup && r.destination === destination)?.fare.shared ?? '30'}
                </p>
              </div>
            )}
          </div>
          <h3 className="text-white text-xl font-extrabold">Live Sharing</h3>
          <p className="text-accent-100 text-sm font-medium">Same route. Better fare.</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-accent-100">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 3 passengers nearby</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> 1 seat available</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-white font-bold">Find Shared Ride</span>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-accent-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Schedule a Commute */}
      <div className="px-5 mt-5">
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full p-5 rounded-3xl bg-white shadow-card border border-ink-100 text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-ink-900">Schedule a Commute</h3>
              <p className="text-sm text-ink-500">Tomorrow ka route abhi plan karo.</p>
            </div>
          </div>
        </button>

        {showSchedule && (
          <div className="mt-3 p-5 rounded-3xl bg-white shadow-card border border-ink-100 animate-fade-in-up space-y-3">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup (e.g. Mohan Nagar)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 outline-none text-sm font-medium text-ink-900 placeholder:text-ink-300"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-500" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination (e.g. ABS)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 outline-none text-sm font-medium text-ink-900 placeholder:text-ink-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 outline-none text-sm font-medium text-ink-900"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 rounded-xl bg-ink-50 border border-ink-100 focus:border-brand-500 outline-none text-sm font-medium text-ink-900"
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (pickup && destination && scheduleDate && scheduleTime) {
                  onSchedule({ pickup, destination, date: scheduleDate, time: scheduleTime });
                  setShowSchedule(false);
                  setScheduleDate('');
                  setScheduleTime('');
                }
              }}
              disabled={!pickup || !destination || !scheduleDate || !scheduleTime}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-bold shadow-brand active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              Schedule Ride
            </button>
          </div>
        )}
      </div>

      {/* Metro Connect */}
      <div className="px-5 mt-5">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-ink-800 to-ink-900 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-xl">🚇</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white">Metro Connect</h3>
                <span className="px-1.5 py-0.5 rounded-md bg-accent-500/20 text-accent-300 text-[10px] font-bold uppercase">Soon</span>
              </div>
              <p className="text-sm text-ink-400">Last-mile connectivity from metro stations.</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span>Sector 62 Metro → ABS · Shared autos coming soon</span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 mb-4">
        <MetroDoodle className="w-full h-24 opacity-30" />
      </div>
    </div>
  );
}
