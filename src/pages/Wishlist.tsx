import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';

export default function Wishlist() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!ids.length) { setLoading(false); return; }
    supabase.from('ecom_products').select('*').in('id', ids).then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-poppins font-bold text-4xl text-[#0A0A0A] mb-8">My Wishlist</h1>
        {loading ? <p className="text-[#2C2C2C]/60">Loading...</p> : products.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
        ) : (
          <div className="text-center py-24">
            <Heart size={56} className="mx-auto text-[#2C2C2C]/20" />
            <p className="text-[#2C2C2C]/60 mt-4">Your wishlist is empty.</p>
            <Link to="/shop" className="inline-block mt-5 bg-[#0A0A0A] text-white px-7 py-3.5 rounded-full font-medium hover:bg-[#8B2635] transition">Explore Products</Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
