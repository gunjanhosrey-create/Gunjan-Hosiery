import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { IndianRupee, ShoppingCart, Package, Users } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [monthly, setMonthly] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    const run = async () => {
      const { data: orders } = await supabase.from('ecom_orders').select('total, created_at, status');
      const { count: pc } = await supabase.from('ecom_products').select('id', { count: 'exact', head: true });
      const { count: cc } = await supabase.from('ecom_customers').select('id', { count: 'exact', head: true });
      const paid = (orders || []).filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered');
      const revenue = paid.reduce((s, o) => s + (o.total || 0), 0);
      setStats({ revenue, orders: (orders || []).length, products: pc || 0, customers: cc || 0 });

      const buckets: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets[d.toLocaleString('default', { month: 'short' })] = 0;
      }
      paid.forEach(o => {
        const m = new Date(o.created_at).toLocaleString('default', { month: 'short' });
        if (m in buckets) buckets[m] += o.total || 0;
      });
      setMonthly(Object.entries(buckets).map(([label, value]) => ({ label, value })));
    };
    run();
  }, []);

  const cards = [
    { icon: IndianRupee, label: 'Revenue', value: formatPrice(stats.revenue), color: 'bg-[#8B2635]' },
    { icon: ShoppingCart, label: 'Orders', value: stats.orders, color: 'bg-[#D4622F]' },
    { icon: Package, label: 'Products', value: stats.products, color: 'bg-[#0A0A0A]' },
    { icon: Users, label: 'Customers', value: stats.customers, color: 'bg-[#2C2C2C]' },
  ];
  const max = Math.max(...monthly.map(m => m.value), 1);

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border p-5">
            <div className={`w-11 h-11 rounded-xl ${c.color} text-white flex items-center justify-center mb-3`}><c.icon size={20} /></div>
            <p className="text-[#2C2C2C]/50 text-xs">{c.label}</p>
            <p className="font-poppins font-bold text-2xl mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold mb-6">Revenue (last 6 months)</h3>
        <div className="flex items-end gap-4 h-56">
          {monthly.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="w-full bg-[#8B2635] rounded-t-lg transition-all" style={{ height: `${(m.value / max) * 100}%`, minHeight: '4px' }} title={formatPrice(m.value)} />
              <span className="text-xs text-[#2C2C2C]/50 mt-2">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
