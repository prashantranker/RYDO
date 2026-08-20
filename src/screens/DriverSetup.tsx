import { useState } from 'react';
import { Car, FileText, Upload, Check, Shield, ArrowRight, IndianRupee } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { VehicleType, VerificationStatus } from '@/types';

interface DriverSetupProps {
  onDone: () => void;
}

export function DriverSetup({ onDone }: DriverSetupProps) {
  const { profile, driver, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [vehicleType, setVehicleType] = useState<VehicleType>('auto');
  const [regNumber, setRegNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const docList = [
    { key: 'aadhaar', label: 'Aadhaar Card' },
    { key: 'licence', label: 'Driving Licence' },
    { key: 'rc', label: 'RC (Registration Certificate)' },
    { key: 'vehicle_photo', label: 'Vehicle Photo' },
    { key: 'bank_proof', label: 'Bank/UPI Proof' },
  ];

  async function handleSave() {
    setSaving(true);
    if (profile && driver) {
      await supabase.from('vehicles').insert({
        driver_id: driver.id,
        type: vehicleType,
        registration_number: regNumber,
        capacity,
        verification_status: 'pending',
      });

      await supabase.from('drivers').update({
        upi_id: upiId,
        bank_account: bankAccount,
        verification_status: 'under_review',
      }).eq('id', driver.id);

      for (const [key, uploaded] of Object.entries(docs)) {
        if (uploaded) {
          await supabase.from('driver_documents').insert({
            driver_id: driver.id,
            document_type: key,
            storage_path: `driver-docs/${driver.id}/${key}`,
            verification_status: 'pending',
          });
        }
      }

      await refreshProfile();
    }
    setSaving(false);
    onDone();
  }

  const steps = ['Vehicle', 'KYC', 'Bank Details'];

  return (
    <div className="screen-container flex flex-col bg-white">
      <div className="px-6 pt-12 pb-4">
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-brand-600' : 'bg-ink-100'}`} />
          ))}
        </div>
        <h1 className="text-3xl font-extrabold text-ink-900">{steps[step]}</h1>
        <p className="mt-2 text-ink-500">
          {step === 0 && 'Tell us about your vehicle.'}
          {step === 1 && 'Complete your KYC verification.'}
          {step === 2 && 'Where should we send your earnings?'}
        </p>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {step === 0 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Vehicle Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setVehicleType('auto'); setCapacity(4); }}
                  className={`p-4 rounded-2xl border-2 transition-all ${vehicleType === 'auto' ? 'border-brand-600 bg-brand-50' : 'border-ink-100'}`}
                >
                  <Car className={`w-8 h-8 mx-auto mb-2 ${vehicleType === 'auto' ? 'text-brand-600' : 'text-ink-400'}`} />
                  <span className="block font-bold text-ink-900">Auto</span>
                  <span className="block text-xs text-ink-500">4 seats</span>
                </button>
                <button
                  onClick={() => { setVehicleType('e_rickshaw'); setCapacity(3); }}
                  className={`p-4 rounded-2xl border-2 transition-all ${vehicleType === 'e_rickshaw' ? 'border-brand-600 bg-brand-50' : 'border-ink-100'}`}
                >
                  <Car className={`w-8 h-8 mx-auto mb-2 ${vehicleType === 'e_rickshaw' ? 'text-brand-600' : 'text-ink-400'}`} />
                  <span className="block font-bold text-ink-900">E-Rickshaw</span>
                  <span className="block text-xs text-ink-500">3 seats</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Registration Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="e.g. UP 32 AB 1234"
                className="w-full px-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300 uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Seating Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 4)}
                min={1}
                max={6}
                className="w-full px-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-50 mb-2">
              <Shield className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brand-800">
                Your documents are stored securely and only used for verification. They are never shared.
              </p>
            </div>
            {docList.map((doc) => (
              <button
                key={doc.key}
                onClick={() => setDocs({ ...docs, [doc.key]: !docs[doc.key] })}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  docs[doc.key] ? 'border-brand-600 bg-brand-50' : 'border-ink-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${docs[doc.key] ? 'text-brand-600' : 'text-ink-400'}`} />
                  <span className="font-semibold text-ink-800">{doc.label}</span>
                </div>
                {docs[doc.key] ? (
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <Upload className="w-5 h-5 text-ink-400" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">UPI ID</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Bank Account Number (Optional)</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="XXXXXXXXXXXX"
                className="w-full px-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300"
              />
            </div>
            <div className="p-4 rounded-2xl bg-accent-50 border border-accent-100">
              <p className="text-sm text-accent-800">
                Once submitted, your profile will be reviewed. You'll receive a notification when your verification is complete.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => (step < 2 ? setStep(step + 1) : handleSave())}
          disabled={saving || (step === 0 && !regNumber.trim())}
          className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? 'Submitting...' : step < 2 ? <>Continue <ArrowRight className="w-5 h-5" /></> : 'Submit for Verification'}
        </button>
      </div>
    </div>
  );
}

export function DriverVerificationStatus({ status, onContinue }: { status: VerificationStatus; onContinue: () => void }) {
  const statusInfo: Record<string, { label: string; desc: string; color: string }> = {
    pending: { label: 'Pending Verification', desc: 'Please complete your registration to get verified.', color: 'accent' },
    under_review: { label: 'Under Review', desc: 'We\'re verifying your documents. This usually takes 24-48 hours.', color: 'accent' },
    verified: { label: 'Verified!', desc: 'You\'re all set to start accepting rides.', color: 'brand' },
    active: { label: 'Active', desc: 'You\'re ready to go online and accept rides.', color: 'brand' },
    rejected: { label: 'Verification Rejected', desc: 'Please re-submit your documents for review.', color: 'red' },
  };

  const info = statusInfo[status] ?? statusInfo.pending;

  return (
    <div className="screen-container flex flex-col items-center justify-center bg-white px-8">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${info.color === 'brand' ? 'bg-brand-100' : info.color === 'red' ? 'bg-red-100' : 'bg-accent-100'}`}>
        <Shield className={`w-12 h-12 ${info.color === 'brand' ? 'text-brand-600' : info.color === 'red' ? 'text-red-500' : 'text-accent-500'}`} />
      </div>
      <h1 className="text-2xl font-extrabold text-ink-900 text-center">{info.label}</h1>
      <p className="mt-3 text-ink-500 text-center max-w-xs">{info.desc}</p>
      {(status === 'verified' || status === 'active') && (
        <button
          onClick={onContinue}
          className="mt-8 w-full max-w-xs py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform"
        >
          Go to Dashboard
        </button>
      )}
    </div>
  );
}
