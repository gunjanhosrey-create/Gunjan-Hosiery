import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, Trash2 } from 'lucide-react';

export default function AdminReviews() {
  const [rows, setRows] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase.from('product_reviews').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    const { data: prods } = await supabase.from('ecom_products').select('id,name');
    const map: Record<string, string> = {};
    (prods || []).forEach(p => { map[p.id] = p.name; });
    setProducts(map);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => { await supabase.from('product_reviews').update({ status }).eq('id', id); load(); };
  const del = async (id: string) => { if (confirm('Delete review?')) { await supabase.from('product_reviews').delete().eq('id', id); load(); } };

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl mb-6">Reviews ({rows.length})</h2>
      <div className="space-y-3">
        {rows.length ? rows.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{r.user_name} <span className="text-[#2C2C2C]/40">on {products[r.product_id] || 'product'}</span></p>
                <span className="flex my-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className={i < r.rating ? 'fill-[#D4622F] text-[#D4622F]' : 'text-gray-300'} />)}</span>
                {r.title && <p className="font-medium text-sm mt-1">{r.title}</p>}
                <p className="text-sm text-[#2C2C2C]/70 mt-1">{r.body}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={r.status} onChange={e => setStatus(r.id, e.target.value)} className="border rounded-lg px-2 py-1 text-xs">
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="hidden">Hidden</option>
                </select>
                <button onClick={() => del(r.id)} className="text-[#8B2635]"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        )) : <p className="text-center text-[#2C2C2C]/50 py-12">No reviews yet.</p>}
      </div>
    </div>
  );
}
