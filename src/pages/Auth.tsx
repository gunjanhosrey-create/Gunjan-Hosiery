import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password);
      if (error) setError(error); else nav('/dashboard');
    } else {
      const { error } = await signUp(form.email, form.password, form.name);
      if (error) setError(error); else setInfo('Account created! Please check your email to confirm, then log in.');
    }
    setLoading(false);
  };

  return (
    <PageShell>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8">
          <h1 className="font-poppins font-bold text-3xl text-[#0A0A0A] text-center">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-center text-[#2C2C2C]/60 text-sm mt-2">{mode === 'login' ? 'Sign in to your account' : 'Join the Gunjan family'}</p>

          <button onClick={signInWithGoogle} className="w-full mt-6 border border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 font-medium hover:bg-[#FAF8F5] transition text-sm">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" /> Continue with Google
          </button>
          <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-[#2C2C2C]/40">OR</span><div className="flex-1 h-px bg-gray-200" /></div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && <input placeholder="Full Name" className="w-full border rounded-xl p-3 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
            <input required type="email" placeholder="Email" className="w-full border rounded-xl p-3 text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input required type="password" placeholder="Password" className="w-full border rounded-xl p-3 text-sm" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {info && <p className="text-[#8B2635] text-sm">{info}</p>}
            <button disabled={loading} className="w-full bg-[#0A0A0A] text-white py-3.5 rounded-xl font-medium hover:bg-[#8B2635] transition disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-[#2C2C2C]/60 mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-[#8B2635] font-medium">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          <p className="text-center text-xs text-[#2C2C2C]/40 mt-4">Are you a distributor? <Link to="/distributor" className="text-[#8B2635]">Register here</Link></p>
        </div>
      </div>
    </PageShell>
  );
}
