import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPeople({ tab }: { tab: 'queries' | 'distributors' }) {
  const [rows, setRows] = useState<any[]>([]);
  const table = tab === 'queries' ? 'customer_queries' : 'distributors';

  const load = () => supabase.from(table).select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, [tab]);

  const setStatus = async (id: string, status: string) => {
    await supabase.from(table).update({ status }).eq('id', id);
    load();
  };

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl mb-6 capitalize">{tab} ({rows.length})</h2>
      <div className="space-y-3">
        {rows.length ? rows.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border p-5">
            {tab === 'queries' ? (
              <>
                <div className="flex justify-between">
                  <div><p className="font-medium">{r.name} <span className="text-[#2C2C2C]/40 text-sm">· {r.email}</span></p><p className="text-sm font-semibold mt-1">{r.subject || '(no subject)'}</p></div>
                  <select value={r.status} onChange={e => setStatus(r.id, e.target.value)} className="border rounded-lg px-2 py-1 text-xs h-fit"><option value="new">New</option><option value="resolved">Resolved</option></select>
                </div>
                <p className="text-sm text-[#2C2C2C]/70 mt-2">{r.message}</p>
              </>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{r.business_name}</p>
                  <p className="text-sm text-[#2C2C2C]/60">{r.contact_name} · {r.email} · {r.phone}</p>
                  <p className="text-xs mt-1">GST: <span className="font-mono">{r.gst_number}</span> {r.gst_valid && <span className="text-green-600">✓ verified</span>}</p>
                </div>
                <select value={r.status} onChange={e => setStatus(r.id, e.target.value)} className="border rounded-lg px-2 py-1 text-xs"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
              </div>
            )}
            <p className="text-xs text-[#2C2C2C]/40 mt-2">{new Date(r.created_at).toLocaleString()}</p>
          </div>
        )) : <p className="text-center text-[#2C2C2C]/50 py-12">No records.</p>}
      </div>
    </div>
  );
}
