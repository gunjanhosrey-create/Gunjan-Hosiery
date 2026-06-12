import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  const load = () => supabase.from('ecom_orders').select('*').order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []));
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string) => {
    await supabase.from('ecom_orders').update({ status }).eq('id', id);
    load();
  };

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl mb-6">Orders ({orders.length})</h2>
      <div className="bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-[#FAF8F5] text-left text-[#2C2C2C]/60">
            <tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Date</th><th className="p-4">Status</th></tr>
          </thead>
          <tbody>
            {orders.length ? orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-4 font-medium">#{o.id.slice(0, 8)}</td>
                <td className="p-4 text-[#2C2C2C]/70">{o.shipping_address?.name || '—'}<br /><span className="text-xs text-[#2C2C2C]/40">{o.shipping_address?.email}</span></td>
                <td className="p-4">{formatPrice(o.total)}</td>
                <td className="p-4 text-[#2C2C2C]/60">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <select value={o.status} onChange={e => update(o.id, e.target.value)} className="border rounded-lg px-2 py-1.5 text-xs capitalize">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            )) : <tr><td colSpan={5} className="p-12 text-center text-[#2C2C2C]/50">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
