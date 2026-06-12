import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const primaryCollections = [
  { handle: 'boys', title: 'Boys' },
  { handle: 'girls', title: 'Girls' },
  { handle: 'kids', title: 'Kids' },
  { handle: 'thermal', title: 'Thermal' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState('');
  const { count } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      nav(`/shop?q=${encodeURIComponent(q)}`);
      setShowSearch(false);
      setOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm' : 'bg-white'}`}>
      <div className="hidden md:flex items-center justify-center bg-[#F5F1ED] text-[#2C2C2C] text-xs py-1.5 tracking-wide">
        Free shipping on all orders - Easy 7-day returns
      </div>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button className="md:hidden p-2" onClick={() => setOpen(true)}><Menu size={22} /></button>
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/gunjan-logo.png" alt="Gunjan Hosiery logo" className="h-9 w-9 rounded-full object-contain" />
            <span className="font-poppins font-bold text-xl md:text-2xl tracking-tight text-[#0A0A0A]">GUNJAN</span>
            <span className="hidden sm:inline text-[10px] tracking-[0.3em] text-[#8B2635] font-semibold mt-1">GARMENTS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link to="/shop" className="text-sm font-medium text-[#0A0A0A] hover:text-[#8B2635] transition">Shop All</Link>
            {primaryCollections.map(c => (
              <Link key={c.handle} to={c.handle === 'thermal' ? '/thermal' : `/collections/${c.handle}`} className="text-sm font-medium text-[#0A0A0A] hover:text-[#8B2635] transition">{c.title}</Link>
            ))}
            <Link to="/collections/best-sellers" className="text-sm font-medium text-[#D4622F] hover:text-[#8B2635] transition">Offers</Link>
            <Link to="/about" className="text-sm font-medium text-[#0A0A0A] hover:text-[#8B2635] transition">About</Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={() => setShowSearch(s => !s)} className="p-2 hover:text-[#8B2635] transition"><Search size={20} /></button>
            <Link to="/wishlist" className="p-2 hover:text-[#8B2635] transition hidden sm:block"><Heart size={20} /></Link>
            <Link to={user ? '/dashboard' : '/auth'} className="p-2 hover:text-[#8B2635] transition"><User size={20} /></Link>
            <Link to="/cart" className="p-2 relative hover:text-[#8B2635] transition">
              <ShoppingBag size={20} />
              {count > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#8B2635] text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-semibold">{count}</span>}
            </Link>
          </div>
        </div>

        {showSearch && (
          <form onSubmit={doSearch} className="pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search boys, girls, kids, thermal..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F5F1ED] focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30 text-sm" />
            </div>
          </form>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 flex flex-col gap-1">
            <div className="flex justify-between items-center mb-4">
              <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                <img src="/gunjan-logo.png" alt="Gunjan Hosiery logo" className="h-9 w-9 rounded-full object-contain" />
                <span className="font-poppins font-bold text-xl">GUNJAN</span>
              </Link>
              <button onClick={() => setOpen(false)}><X size={22} /></button>
            </div>
            <Link to="/shop" onClick={() => setOpen(false)} className="py-3 border-b text-[#0A0A0A] font-medium">Shop All</Link>
            {primaryCollections.map(c => (
              <Link key={c.handle} to={c.handle === 'thermal' ? '/thermal' : `/collections/${c.handle}`} onClick={() => setOpen(false)} className="py-3 border-b text-[#0A0A0A] font-medium">{c.title}</Link>
            ))}
            <Link to="/about" onClick={() => setOpen(false)} className="py-3 border-b text-[#0A0A0A] font-medium">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-3 border-b text-[#0A0A0A] font-medium">Contact</Link>
            <Link to="/wishlist" onClick={() => setOpen(false)} className="py-3 text-[#0A0A0A] font-medium">Wishlist</Link>
          </div>
        </div>
      )}
    </header>
  );
}
