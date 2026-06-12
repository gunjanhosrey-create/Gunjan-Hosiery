import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Lock } from 'lucide-react';
import { PROJECT_ID } from '@/lib/format';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const nav = useNavigate();

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch(`https://famous.ai/api/crm/${PROJECT_ID}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer-signup', tags: ['newsletter'] }),
      });
    } catch {}
    setDone(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#0A0A0A] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/gunjan-logo.png" alt="Gunjan Hosiery logo" className="h-10 w-10 rounded-full bg-white object-contain" />
              <h3 className="font-poppins font-bold text-2xl">GUNJAN <span className="text-[#D4622F]">HOSIERY</span></h3>
            </Link>
            <p className="text-white/60 text-sm mt-3 max-w-sm leading-relaxed">
              Premium yet affordable everyday essentials for boys, girls, kids and winter thermal wear. Crafted with combed cotton, built to last.
            </p>
            <form onSubmit={subscribe} className="mt-6 flex gap-2 max-w-sm">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Your email"
                className="flex-1 bg-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4622F]/50" />
              <button className="bg-[#D4622F] hover:bg-[#8B2635] transition px-5 rounded-lg text-sm font-medium">Join</button>
            </form>
            {done && <p className="text-[#D4622F] text-xs mt-2">Thanks for subscribing!</p>}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">SHOP</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/collections/boys" className="hover:text-white">Boys</Link></li>
              <li><Link to="/collections/girls" className="hover:text-white">Girls</Link></li>
              <li><Link to="/collections/kids" className="hover:text-white">Kids</Link></li>
              <li><Link to="/thermal" className="hover:text-white">Thermal</Link></li>
              <li><Link to="/collections/best-sellers" className="hover:text-white">Best Sellers</Link></li>
              <li><Link to="/collections/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">COMPANY</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/distributor" className="hover:text-white">Become a Distributor</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">FOLLOW</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4622F] transition"><Instagram size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4622F] transition"><Facebook size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4622F] transition"><Twitter size={16} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/40 text-xs">Copyright {new Date().getFullYear()} Gunjan Hosiery. All rights reserved.</p>
          <button onClick={() => nav('/admin')} className="text-white/20 hover:text-white/50 transition flex items-center gap-1 text-xs">
            <Lock size={11} /> Admin
          </button>
        </div>
      </div>
    </footer>
  );
}
