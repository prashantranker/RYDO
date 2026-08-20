import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Plus, ArrowDownLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/constants';
import type { Payment } from '@/types';

export function PassengerWallet() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('passenger_id', profile.id)
        .order('created_at', { ascending: false });
      setPayments((data as Payment[]) ?? []);
      setLoading(false);
    })();
  }, [profile]);

  const totalSpent = payments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalRides = payments.filter(p => p.payment_status === 'paid').length;

  return (
    <div className="screen-container bg-ink-50 pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900">Wallet</h1>
      </div>

      <div className="px-5">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-6 shadow-brand">
          <p className="text-brand-100 text-sm font-medium">Total Spent</p>
          <p className="text-white text-4xl font-extrabold mt-1">{formatINR(totalSpent)}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-brand-100 text-xs">Total Rides</p>
              <p className="text-white font-bold text-lg">{totalRides}</p>
            </div>
            <div>
              <p className="text-brand-100 text-xs">Avg. Fare</p>
              <p className="text-white font-bold text-lg">{totalRides > 0 ? formatINR(totalSpent / totalRides) : '₹0'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink-900">Transaction History</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-2xl shimmer-bg" />)}
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.payment_status === 'paid' ? 'bg-red-50' : 'bg-ink-100'}`}>
                  <ArrowDownLeft className={`w-5 h-5 ${payment.payment_status === 'paid' ? 'text-red-500' : 'text-ink-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink-900 text-sm">Ride Payment</p>
                  <p className="text-xs text-ink-400">
                    {new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink-900">-{formatINR(payment.amount)}</p>
                  <span className={`text-xs font-semibold capitalize ${payment.payment_status === 'paid' ? 'text-brand-600' : 'text-ink-400'}`}>
                    {payment.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-ink-400">No transactions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
