import { useState } from 'react';
import PageShell from '@/components/PageShell';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function Distributor() {
  const [form, setForm] = useState({ business_name: '', contact_name: '', email: '', phone: '', gst_number: '' });
  const [gstState, setGstState] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const verifyGst = (val: string) => {
    const gst = val.toUpperCase();
    setForm(f => ({ ...f, gst_number: gst }));
    if (gst.length < 15) { setGstState('idle'); return; }
    setGstState('checking');
    setTimeout(() => setGstState(GST_RE.test(gst) ? 'valid' : 'invalid'), 700);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (gstState !== 'valid') { setError('Please enter a valid 15-digit GST number to continue.'); return; }
    const { error } = await supabase.from('distributors').insert({ ...form, gst_valid: true, status: 'pending' });
    if (error) { setError(error.message); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <CheckCircle2 size={64} className="mx-auto text-[#8B2635]" />
          <h1 className="font-poppins font-bold text-3xl mt-5">Application Submitted!</h1>
          <p className="text-[#2C2C2C]/60 mt-3">Your GST was verified successfully. Our team will review your distributor application and reach out within 48 hours.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="font-poppins font-bold text-4xl text-[#0A0A0A] text-center">Become a Distributor</h1>
        <p className="text-center text-[#2C2C2C]/60 mt-2">Partner with Gunjan Hosiery and grow your business with wholesale pricing.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 bg-white border border-gray-100 shadow-sm rounded-3xl p-7">
          <input required placeholder="Business Name" className="w-full border rounded-xl p-3 text-sm" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
          <input required placeholder="Contact Person" className="w-full border rounded-xl p-3 text-sm" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
          <input required type="email" placeholder="Email" className="w-full border rounded-xl p-3 text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input required placeholder="Phone" className="w-full border rounded-xl p-3 text-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <div>
            <div className="relative">
              <input required maxLength={15} placeholder="GST Number (15 chars)" className={`w-full border rounded-xl p-3 text-sm uppercase pr-10 ${gstState === 'valid' ? 'border-green-400' : gstState === 'invalid' ? 'border-red-400' : ''}`} value={form.gst_number} onChange={e => verifyGst(e.target.value)} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {gstState === 'checking' && <Loader2 size={18} className="animate-spin text-[#2C2C2C]/50" />}
                {gstState === 'valid' && <CheckCircle2 size={18} className="text-green-500" />}
                {gstState === 'invalid' && <XCircle size={18} className="text-red-500" />}
              </span>
            </div>
            {gstState === 'valid' && <p className="text-green-600 text-xs mt-1.5">GST verified successfully ✓</p>}
            {gstState === 'invalid' && <p className="text-red-600 text-xs mt-1.5">Invalid GST format. Example: 22AAAAA0000A1Z5</p>}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="w-full bg-[#0A0A0A] text-white py-3.5 rounded-xl font-medium hover:bg-[#8B2635] transition">Submit Application</button>
        </form>
      </div>
    </PageShell>
  );
}
