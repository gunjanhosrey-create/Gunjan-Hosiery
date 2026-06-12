import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, Building2, Lock, ArrowLeft, Star, Images } from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminPeople from './AdminPeople';
import AdminReviews from './AdminReviews';
import AdminCollections from './AdminCollections';

const ADMIN_PASSWORD = 'gunjan2026';

const NAV = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'collections', label: 'Collections', icon: Images },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'queries', label: 'Customer Queries', icon: MessageSquare },
  { key: 'distributors', label: 'Distributors', icon: Building2 },
];

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_ok') === '1');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [active, setActive] = useState('overview');

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { sessionStorage.setItem('admin_ok', '1'); setAuthed(true); }
    else setErr('Incorrect password');
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
        <form onSubmit={login} className="bg-white rounded-2xl p-8 w-full max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#8B2635] text-white flex items-center justify-center mx-auto mb-5"><Lock size={24} /></div>
          <h1 className="font-poppins font-bold text-2xl text-center">Admin Access</h1>
          <p className="text-center text-[#2C2C2C]/50 text-sm mt-1">Gunjan Hosiery Control Panel</p>
          <input type="password" placeholder="Password" className="w-full border rounded-xl p-3 text-sm mt-6" value={pw} onChange={e => { setPw(e.target.value); setErr(''); }} />
          {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
          <button className="w-full bg-[#0A0A0A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#8B2635]">Enter</button>
          <Link to="/" className="block text-center text-xs text-[#2C2C2C]/40 mt-4">Back to store</Link>
          <p className="text-center text-[10px] text-[#2C2C2C]/30 mt-3">Demo password: gunjan2026</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] lg:flex">
      <aside className="lg:w-64 bg-[#0A0A0A] text-white lg:fixed lg:h-full">
        <div className="p-5 lg:p-6 border-b border-white/10 flex items-center justify-between">
          <h1 className="font-poppins font-bold text-xl">GUNJAN <span className="text-[#D4622F]">Admin</span></h1>
          <Link to="/" className="lg:hidden text-white/60"><ArrowLeft size={18} /></Link>
        </div>
        <nav className="p-3 lg:p-4 flex lg:block gap-2 overflow-x-auto lg:space-y-1">
          {NAV.map(n => (
            <button key={n.key} onClick={() => setActive(n.key)}
              className={`shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${active === n.key ? 'bg-[#8B2635] text-white' : 'text-white/60 hover:bg-white/5'}`}>
              <n.icon size={18} /> {n.label}
            </button>
          ))}
        </nav>
        <Link to="/" className="hidden lg:flex m-4 items-center gap-2 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5"><ArrowLeft size={16} /> Back to Store</Link>
      </aside>

      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        {active === 'overview' && <AdminOverview />}
        {active === 'products' && <AdminProducts />}
        {active === 'collections' && <AdminCollections />}
        {active === 'orders' && <AdminOrders />}
        {active === 'reviews' && <AdminReviews />}
        {active === 'queries' && <AdminPeople tab="queries" />}
        {active === 'distributors' && <AdminPeople tab="distributors" />}
      </main>
    </div>
  );
}
