import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';

const STATUSES = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('ecom_orders')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('ORDERS:', data);
    console.log('ERROR:', error);

    if (!error) {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: number, status: string) => {
    const { error } = await supabase
      .from('ecom_orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(error);
      return;
    }

    load();
  };

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl mb-6">
        Orders ({orders.length})
      </h2>

      <div className="bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF8F5]">
            <tr>
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Payment</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-4">#{o.id}</td>

                  <td className="p-4">
                    {o.shipping_address?.name || '-'}
                  </td>

                  <td className="p-4">
                    {o.shipping_address?.email || '-'}
                  </td>

                  <td className="p-4">
                    {formatPrice(o.total || 0)}
                  </td>

                  <td className="p-4">
                    {o.payment_method || 'Online'}
                  </td>

                  <td className="p-4">
                    <select
                      value={o.status || 'pending'}
                      onChange={(e) =>
                        update(o.id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString()
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}