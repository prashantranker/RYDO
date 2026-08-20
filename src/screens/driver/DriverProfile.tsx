import { useState, useEffect } from 'react';
import { User, Car, Shield, IndianRupee, Star, ChevronRight, LogOut, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Vehicle, DriverDocument } from '@/types';

export function DriverProfile() {
  const { profile, driver, signOut } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [documents, setDocuments] = useState<DriverDocument[]>([]);

  useEffect(() => {
    if (!driver) return;
    (async () => {
      const { data: v } = await supabase.from('vehicles').select('*').eq('driver_id', driver.id).limit(1);
      if (v && v.length > 0) setVehicle(v[0] as Vehicle);

      const { data: docs } = await supabase.from('driver_documents').select('*').eq('driver_id', driver.id);
      setDocuments((docs as DriverDocument[]) ?? []);
    })();
  }, [driver]);

  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    pending: { label: 'Pending Verification', color: 'text-accent-600 bg-accent-50', icon: Clock },
    under_review: { label: 'Under Review', color: 'text-accent-600 bg-accent-50', icon: Clock },
    verified: { label: 'Verified', color: 'text-brand-600 bg-brand-50', icon: CheckCircle },
    active: { label: 'Active', color: 'text-brand-600 bg-brand-50', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'text-red-600 bg-red-50', icon: Shield },
  };

  const status = driver ? statusConfig[driver.verification_status] ?? statusConfig.pending : statusConfig.pending;
  const StatusIcon = status.icon;

  const docList = [
    { key: 'aadhaar', label: 'Aadhaar Card' },
    { key: 'licence', label: 'Driving Licence' },
    { key: 'rc', label: 'RC' },
    { key: 'vehicle_photo', label: 'Vehicle Photo' },
    { key: 'bank_proof', label: 'Bank/UPI Proof' },
  ];

  return (
    <div className="screen-container bg-ink-50 pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-ink-900">Profile</h1>
      </div>

      {/* Driver Info */}
      <div className="px-5">
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
              {profile?.name?.[0]?.toUpperCase() ?? 'D'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink-900">{profile?.name ?? 'Driver'}</h2>
              <p className="text-sm text-ink-500">{profile?.email ?? ''}</p>
              <p className="text-sm text-ink-500">{profile?.phone ?? ''}</p>
            </div>
          </div>
          <div className={`mt-4 flex items-center gap-2 px-3 py-2 rounded-xl ${status.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-bold">{status.label}</span>
          </div>
          {driver && (
            <div className="flex items-center gap-2 mt-3">
              <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
              <span className="text-sm font-bold text-ink-700">{driver.rating.toFixed(1)}</span>
              <span className="text-xs text-ink-400">({driver.total_ratings} ratings)</span>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="px-5 mt-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Vehicle</h3>
        <div className="bg-white rounded-2xl p-4 shadow-card">
          {vehicle ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                <Car className="w-6 h-6 text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-ink-900">{vehicle.type === 'auto' ? 'Auto Rickshaw' : 'E-Rickshaw'}</p>
                <p className="text-sm text-ink-500">{vehicle.registration_number}</p>
                <p className="text-xs text-ink-400">Capacity: {vehicle.capacity} seats</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vehicle.verification_status === 'verified' ? 'bg-brand-50 text-brand-600' : 'bg-accent-50 text-accent-600'}`}>
                {vehicle.verification_status}
              </span>
            </div>
          ) : (
            <p className="text-sm text-ink-400">No vehicle registered</p>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="px-5 mt-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Documents</h3>
        <div className="bg-white rounded-2xl shadow-card divide-y divide-ink-50">
          {docList.map((doc) => {
            const uploaded = documents.find(d => d.document_type === doc.key);
            return (
              <div key={doc.key} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-ink-500" />
                </div>
                <span className="flex-1 font-semibold text-ink-900 text-sm">{doc.label}</span>
                {uploaded ? (
                  <span className="px-2 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold">
                    {uploaded.verification_status}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-ink-50 text-ink-400 text-xs font-semibold">
                    Not uploaded
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bank Details */}
      <div className="px-5 mt-5">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">Banking</h3>
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">UPI: {driver?.upi_id || 'Not set'}</p>
              <p className="text-xs text-ink-400">Bank: {driver?.bank_account ? '****' + driver.bank_account.slice(-4) : 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-bold active:scale-[0.98] transition-transform"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      <div className="px-5 mt-6 text-center">
        <p className="text-xs text-ink-400">RYDO · हर सफर बेफिकर</p>
        <p className="text-xs text-ink-300 mt-1">Ride Milegi, Saath Bhi.</p>
      </div>
    </div>
  );
}
