import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
interface AuthScreenProps {
  role: 'passenger' | 'driver';
  onBack: () => void;
}

export function AuthScreen({ role, onBack }: AuthScreenProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      if (!name.trim() || !phone.trim()) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, role, name, phone);
      if (error) setError(error);
    }
    setLoading(false);
  }

  return (
    <div className="screen-container flex flex-col bg-white">
      <div className="px-6 pt-12 pb-4">
        <button onClick={onBack} className="mb-6 p-2 -ml-2 rounded-xl hover:bg-ink-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-ink-700" />
        </button>
        <h1 className="text-3xl font-extrabold text-ink-900">
          {mode === 'login' ? 'Welcome back!' : 'Join RYDO'}
        </h1>
        <p className="mt-2 text-ink-500">
          {mode === 'login'
            ? `Sign in as ${role === 'driver' ? 'a driver' : 'a passenger'}.`
            : `Create your ${role} account.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Mobile Number</label>
              <div className="flex items-center gap-2">
                <div className="px-3 py-3.5 rounded-2xl bg-ink-100 font-semibold text-ink-700 text-sm">+91</div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="flex-1 px-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-ink-900 placeholder:text-ink-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-100">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-brand active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="px-6 pb-10 pt-4">
        <p className="text-center text-sm text-ink-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="font-bold text-brand-600 hover:text-brand-700"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
