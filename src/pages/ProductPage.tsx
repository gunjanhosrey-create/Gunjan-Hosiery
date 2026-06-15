import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/format';
import { Star, Truck, RefreshCw, ShieldCheck, Minus, Plus, Check } from 'lucide-react';

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const nav = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [ratingInfo, setRatingInfo] = useState({ avg: 0, count: 0 });

  useEffect(() => {
    const run = async () => {
      setSelectedVariant(null); setSelectedSize(''); setActiveImg(0); setQty(1);
      const { data } = await supabase.from('ecom_products').select('*, variants:ecom_product_variants(*)').eq('handle', handle).single();
      if (!data) return;
      let variants = data.variants || [];
      if (data.has_variants && !variants.length) {
        const { data: v } = await supabase.from('ecom_product_variants').select('*').eq('product_id', data.id).order('position');
        variants = v || []; data.variants = variants;
      }
      setProduct(data);
      if (variants.length) {
        const sorted = [...variants].sort((a, b) => (a.position || 0) - (b.position || 0));
        const first = sorted.find(v => v.inventory_qty == null || v.inventory_qty > 0) || sorted[0];
        setSelectedVariant(first); setSelectedSize(first?.option1 || '');
      }
      const { data: rel } = await supabase.from('ecom_products').select('*').eq('product_type', data.product_type).neq('id', data.id).eq('status', 'active').limit(4);
      setRelated(rel || []);
      const { data: revs } = await supabase.from('product_reviews').select('rating').eq('product_id', data.id).eq('status', 'approved');
      if (revs && revs.length) setRatingInfo({ avg: revs.reduce((s, r) => s + r.rating, 0) / revs.length, count: revs.length });
      else setRatingInfo({ avg: 0, count: 0 });
    };
    run();
    window.scrollTo(0, 0);
  }, [handle]);
  if (!product) return <PageShell><div className="py-32 text-center text-[#2C2C2C]/60">Loading...</div></PageShell>;

  const hasVariants = product.has_variants && product.variants?.length > 0;
  const sizes = [...new Set(product.variants?.map((v: any) => v.option1).filter(Boolean) || [])] as string[];

  const getInStock = () => {
    if (selectedVariant) return selectedVariant.inventory_qty == null || selectedVariant.inventory_qty > 0;
    if (product.variants?.length) return product.variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0);
    if (product.has_variants) return true;
    return product.inventory_qty == null || product.inventory_qty > 0;
  };
  const inStock = getInStock();
  const currentPrice = selectedVariant?.price || product.price;
  const rating = (4 + ((product.name?.length || 0) % 10) / 10).toFixed(1);

  const selectSize = (s: string) => {
    setSelectedSize(s);
    const v = product.variants?.find((x: any) => x.option1 === s || x.title?.toLowerCase().includes(s.toLowerCase()));
    if (v) setSelectedVariant(v);
  };
  const handleAdd = () => {
    if (hasVariants && !selectedSize) return;
    if (!inStock) return;
    addToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || undefined,
      name: product.name,
      variant_title: selectedVariant?.title || selectedSize || undefined,
      sku: selectedVariant?.sku || product.sku || product.handle,
      price: currentPrice,
      image: product.images?.[0],
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="text-sm text-[#2C2C2C]/50 mb-6">
          <Link to="/" className="hover:text-[#8B2635]">Home</Link> / <Link to="/shop" className="hover:text-[#8B2635]">Shop</Link> / <span className="text-[#0A0A0A]">{product.name}</span>
        </nav>
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="rounded-3xl overflow-hidden bg-[#F5F1ED] aspect-square">
              <img src={product.images?.[activeImg]} alt={product.name} className="w-100% h-100% object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${activeImg === i ? 'border-[#8B2635]' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-100% h-100% object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8B2635] font-semibold">{product.product_type}</p>
            <h1 className="font-poppins font-bold text-3xl lg:text-4xl text-[#0A0A0A] mt-1">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className={i < Math.round(ratingInfo.avg) ? 'fill-[#D4622F] text-[#D4622F]' : 'text-gray-300'} />)}
              </span>
              <span className="text-sm text-[#2C2C2C]/60">{ratingInfo.count ? `${ratingInfo.avg.toFixed(1)} · ${ratingInfo.count} review${ratingInfo.count > 1 ? 's' : ''}` : 'No reviews yet'}</span>
            </div>
            <p className="font-poppins font-bold text-3xl text-[#0A0A0A] mt-5">{formatPrice(currentPrice)}</p>
            <p className="text-[#2C2C2C]/70 mt-4 leading-relaxed">{product.description}</p>
            {hasVariants && (
              <div className="mt-7">
                <p className="font-semibold text-sm mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map(s => {
                    const v = product.variants.find((x: any) => x.option1 === s);
                    const ok = v ? (v.inventory_qty == null || v.inventory_qty > 0) : true;
                    return (
                      <button key={s} disabled={!ok} onClick={() => ok && selectSize(s)}
                        className={`min-w-[52px] px-4 py-3 rounded-xl border-2 font-medium text-sm transition ${
                          selectedSize === s ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                          : ok ? 'border-gray-200 hover:border-[#8B2635]' : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 mt-7">
              <div className="flex items-center border-2 border-gray-200 rounded-xl">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3"><Minus size={16} /></button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-3"><Plus size={16} /></button>
              </div>
              <button onClick={handleAdd} disabled={(hasVariants && !selectedSize) || !inStock}
                className="flex-1 bg-[#0A0A0A] text-white py-4 rounded-xl font-medium hover:bg-[#8B2635] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {added ? (<><Check size={18} /> Added to Cart</>) : !inStock ? 'Out of Stock' : hasVariants && !selectedSize ? 'Select a Size' : 'Add to Cart'}
              </button>
            </div>
            <button onClick={() => { handleAdd(); nav('/cart'); }} disabled={!inStock}
              className="w-full mt-3 border-2 border-[#0A0A0A] py-3.5 rounded-xl font-medium hover:bg-[#0A0A0A] hover:text-white transition disabled:opacity-50">
              Buy Now
            </button>
            <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t">
              {[[Truck, 'Free Shipping'], [RefreshCw, '7-Day Returns'], [ShieldCheck, 'Secure Checkout']].map(([Icon, t]: any) => (
                <div key={t} className="text-center">
                  <Icon size={20} className="mx-auto text-[#8B2635]" />
                  <p className="text-xs text-[#2C2C2C]/70 mt-1.5">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ProductReviews productId={product.id} />
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-poppins font-bold text-2xl text-[#0A0A0A] mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
