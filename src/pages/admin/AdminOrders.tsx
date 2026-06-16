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
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const { data: ordersData, error: ordersError } = await supabase
      .from('ecom_orders')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: itemsData, error: itemsError } = await supabase
      .from('ecom_order_items')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('ORDERS:', ordersData);
    console.log('ORDER ITEMS:', itemsData);
    console.log('ORDERS ERROR:', ordersError);
    console.log('ITEMS ERROR:', itemsError);

    setOrders(ordersData || []);
    setOrderItems(itemsData || []);

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
    <div className="space-y-10">
      <h1 className="text-red-600 text-4xl mb-6">
        ADMIN ORDERS NEW VERSION
      </h1>
      <div>
        <h2 className="font-poppins font-bold text-2xl mb-6">
          Orders ({orders.length})
        </h2>
        <div className="bg-white rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm min-w-[1800px]">
            <thead className="bg-[#FAF8F5]">
  <tr>
    <th className="p-4 text-left">Order ID</th>
    <th className="p-4 text-left">Customer</th>
    <th className="p-4 text-left">Email</th>
    <th className="p-4 text-left">Address</th>
    <th className="p-4 text-left">Total</th>
    <th className="p-4 text-left">Payment</th>
    <th className="p-4 text-left">Status</th>
    <th className="p-4 text-left">Date</th>
    <th className="p-4 text-left">Item ID</th>
    <th className="p-4 text-left">Image</th>
    <th className="p-4 text-left">Product Name</th>
    <th className="p-4 text-left">Product ID</th>
    <th className="p-4 text-left">Price</th>
    <th className="p-4 text-left">Quantity</th>
    <th className="p-4 text-left">Variant</th>
    <th className="p-4 text-left">Created</th>
  </tr>
</thead>
            <tbody>
  {loading ? (
    <tr>
      <td colSpan={16} className="p-10 text-center">
        Loading...
      </td>
    </tr>
  ) : orders.length === 0 ? (
    <tr>
      <td colSpan={16} className="p-10 text-center">
        No orders found
      </td>
    </tr>
  ) : (
    orders.flatMap((o) => {
      const items = orderItems.filter(
        (item) => item.order_id === o.id
      );

      if (items.length === 0) {
        return (
          <tr key={o.id} className="border-t">
            <td className="p-4">#{o.id}</td>
            <td className="p-4">
              {o.shipping_address?.name || '-'}
            </td>
            <td className="p-4">
              {o.shipping_address?.email || '-'}
            </td>
            <td className="p-4">
              {o.shipping_address?.address || '-'}
            </td>
            <td className="p-4">
              {formatPrice(o.total || 0)}
            </td>
            <td className="p-4">
              {o.payment_method || 'ONLINE'}
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

            <td className="p-4">-</td>
            <td className="p-4">-</td>
            <td className="p-4">-</td>
            <td className="p-4">-</td>
            <td className="p-4">-</td>
            <td className="p-4">-</td>
            <td className="p-4">-</td>
            <td className="p-4">-</td>
          </tr>
        );
      }

      return items.map((item) => (
        <tr
          key={`${o.id}-${item.id}`}
          className="border-t"
        >
          <td className="p-4">#{o.id}</td>

          <td className="p-4">
            {o.shipping_address?.name || '-'}
          </td>

          <td className="p-4">
            {o.shipping_address?.email || '-'}
          </td>

          <td className="p-4">
            <div className="max-w-[250px] text-xs">
              {o.shipping_address?.address || '-'}
              <br />
              {o.shipping_address?.city || ''}
              {o.shipping_address?.state
                ? `, ${o.shipping_address.state}`
                : ''}
              <br />
              {o.shipping_address?.zip || ''}
            </div>
          </td>

          <td className="p-4">
            {formatPrice(o.total || 0)}
          </td>

          <td className="p-4">
            {o.payment_method || 'ONLINE'}
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

          <td className="p-4">{item.id}</td>

          <td className="p-4">
            {item.product_image ? (
              <img
                src={item.product_image}
                alt={item.product_name}
                className="w-16 h-16 object-cover rounded border"
              />
            ) : (
              '-'
            )}
          </td>

          <td className="p-4 font-medium">
            {item.product_name}
          </td>

          <td className="p-4 break-all">
            {item.product_id}
          </td>

          <td className="p-4">
            {formatPrice(item.price || 0)}
          </td>

          <td className="p-4">
            {item.quantity}
          </td>

          <td className="p-4">
            {item.variant || '-'}
          </td>

          <td className="p-4">
            {item.created_at
              ? new Date(item.created_at).toLocaleString()
              : '-'}
          </td>
        </tr>
      ));
    })
  )}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}