import { Home, Clock, Calendar, Wallet, User, TrendingUp, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
  role: 'passenger' | 'driver';
}

const passengerTabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'rides', label: 'Rides', icon: Clock },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

const driverTabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'rides', label: 'Rides', icon: Clock },
  { id: 'earnings', label: 'Earnings', icon: IndianRupeeIcon },
  { id: 'demand', label: 'Demand', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
];

function IndianRupeeIcon(props: { className?: string }) {
  return <TrendingUp {...props} />;
}

export function BottomNav({ active, onChange, role }: BottomNavProps) {
  const tabs = role === 'passenger' ? passengerTabs : driverTabs;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="glass border-t border-ink-100 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 transition-all"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-brand-100' : ''}`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-600' : 'text-ink-400'}`} />
                </div>
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-ink-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
