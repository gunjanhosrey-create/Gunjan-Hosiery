import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { Package, LogOut, User } from 'lucide-react';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) nav('/auth');
  }, [user, loading]);

  useEffect(() => {
    if (!user?.email) return;
    const run = async () => {
      const { data: cust } = await supabase.from('ecom_customers').select('id').eq('email', user.email).maybeSingle();
      if (cust) {
        const { data } = await supabase.from('ecom_orders').select('*').eq('customer_id', cust.id).order('created_at', { ascending: false });
        setOrders(data || []);
      }
    };
    run();
  }, [user]);

  if (!user) return <PageShell><div className="py-32 text-center text-[#2C2C2C]/60">Redirecting...</div></PageShell>;

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8B2635] text-white flex items-center justify-center"><User size={26} /></div>
            <div>
              <h1 className="font-poppins font-bold text-2xl text-[#0A0A0A]">{user.user_metadata?.name || 'My Account'}</h1>
              <p className="text-[#2C2C2C]/60 text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={() => { signOut(); nav('/'); }} className="flex items-center gap-2 text-sm border rounded-full px-4 py-2 hover:bg-[#FAF8F5]"><LogOut size={15} /> Sign Out</button>
        </div>

        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Package size={18} /> Order History</h2>
        {orders.length ? (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="bg-[#FAF8F5] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-[#2C2C2C]/50 mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(o.total)}</p>
                  <span className="text-xs bg-[#8B2635]/10 text-[#8B2635] px-2.5 py-0.5 rounded-full capitalize">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-[#FAF8F5] rounded-2xl py-16">
            <p className="text-[#2C2C2C]/60">No orders yet.</p>
            <Link to="/shop" className="inline-block mt-4 bg-[#0A0A0A] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#8B2635] transition">Start Shopping</Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
