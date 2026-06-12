import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { supabase } from '@/lib/supabase';

interface Props { product: any; }

export default function ProductCard({ product }: Props) {
  const [wish, setWish] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]').includes(product.id); } catch { return false; }
  });
  const [rating, setRating] = useState<{ avg: number; count: number } | null>(null);
  const img = product.images?.[0];
  const img2 = product.images?.[1] || img;

  useEffect(() => {
    supabase.from('product_reviews').select('rating').eq('product_id', product.id).eq('status', 'approved')
      .then(({ data }) => {
        if (data && data.length) setRating({ avg: data.reduce((s, r) => s + r.rating, 0) / data.length, count: data.length });
        else setRating(null);
      });
  }, [product.id]);

  const toggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const next = wish ? list.filter((x: string) => x !== product.id) : [...list, product.id];
    localStorage.setItem('wishlist', JSON.stringify(next));
    setWish(!wish);
  };

  return (
    <Link to={`/product/${product.handle}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-[#F5F1ED] aspect-square">
        {img && (
          <>
            <img src={img} alt={product.name} loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
            <img src={img2} alt={product.name} loading="lazy"
              className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 group-hover:scale-110" />
          </>
        )}
        {product.tags?.includes('new') && (
          <span className="absolute top-3 left-3 bg-[#8B2635] text-white text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full">NEW</span>
        )}
        {product.tags?.includes('bestseller') && !product.tags?.includes('new') && (
          <span className="absolute top-3 left-3 bg-[#D4622F] text-white text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full">BESTSELLER</span>
        )}
        <button onClick={toggleWish}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition hover:scale-110">
          <Heart size={16} className={wish ? 'fill-[#8B2635] text-[#8B2635]' : 'text-[#2C2C2C]'} />
        </button>
        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="block w-full text-center bg-[#0A0A0A] text-white text-sm font-medium py-2.5 rounded-xl">
            View Product
          </span>
        </div>
      </div>
      <div className="pt-3">
        <p className="text-[11px] uppercase tracking-wider text-[#8B2635] font-semibold">{product.product_type}</p>
        <h3 className="text-sm font-medium text-[#0A0A0A] mt-0.5 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-semibold text-[#0A0A0A]">{formatPrice(product.price)}</p>
          {rating ? (
            <span className="flex items-center gap-1 text-xs text-[#2C2C2C]">
              <Star size={13} className="fill-[#D4622F] text-[#D4622F]" /> {rating.avg.toFixed(1)} <span className="text-[#2C2C2C]/40">({rating.count})</span>
            </span>
          ) : (
            <span className="text-xs text-[#2C2C2C]/40">No reviews</span>
          )}
        </div>
      </div>
    </Link>
  );
}
