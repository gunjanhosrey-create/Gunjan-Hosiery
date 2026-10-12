import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/format';
import { Star, Truck, RefreshCw, ShieldCheck, Minus, Plus, Check } from 'lucide-react';

const parseProductValue = (value: any): any => {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
};

const normalizeSizePricing = (value: any): Record<string, any> => {
  const parsed = parseProductValue(value);
  if (Array.isArray(parsed)) {
    return Object.fromEntries(parsed.map((entry: any) => {
      const size = String(entry?.size ?? entry?.option1 ?? entry?.name ?? '').trim();
      return [size, entry];
    }).filter(([size]) => size));
  }
  return parsed && typeof parsed === 'object' ? parsed : {};
};

const normalizeSizes = (value: any): string[] => {
  const parsed = parseProductValue(value);
  if (Array.isArray(parsed)) return parsed.map(item => String(item?.size ?? item?.option1 ?? item).trim()).filter(Boolean);
  if (typeof parsed === 'string') return parsed.split(',').map(item => item.trim()).filter(Boolean);
  if (parsed && typeof parsed === 'object') return Object.keys(parsed);
  return [];
};

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
  const [selectionError, setSelectionError] = useState('');
  const [ratingInfo, setRatingInfo] = useState({ avg: 0, count: 0 });

  useEffect(() => {
    const run = async () => {
      setSelectedVariant(null); setSelectedSize(''); setActiveImg(0); setQty(1);
      const { data, error } = await supabase.from('ecom_products').select('*, variants:ecom_product_variants(*)').eq('handle', handle).single();
      if (error) {
        console.error('PRODUCT LOAD ERROR:', error);
        return;
      }
      if (!data) return;
      let variants = Array.isArray(data.variants) ? data.variants : [];
      if (!variants.length) {
        const { data: v } = await supabase.from('ecom_product_variants').select('*').eq('product_id', data.id).order('position');
        variants = v || []; data.variants = variants;
      }
      setProduct(data);
      setSelectedVariant(null);
      setSelectedSize('');
      const { data: rel } = await supabase.from('ecom_products').select('*').eq('product_type', data.product_type).neq('id', data.id).eq('status', 'active').limit(4);
      setRelated(rel || []);
      const { data: revs } = await supabase.from('product_reviews').select('rating').eq('product_id', data.id).eq('status', 'approved');
      if (revs && revs.length) setRatingInfo({ avg: revs.reduce((s, r) => s + r.rating, 0) / revs.length, count: revs.length });
      else setRatingInfo({ avg: 0, count: 0 });
    };
    run();
  }, [handle]);
  if (!product) return <PageShell><div className="py-32 text-center text-[#2C2C2C]/60">Loading...</div></PageShell>;

  const sizePricing = normalizeSizePricing(product.size_pricing);
  const sizePricingSizes = Object.keys(sizePricing);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const variantSizes = variants.map((variant: any) => String(variant.option1 ?? variant.size ?? '').trim()).filter(Boolean);
  const hasSizePricing = sizePricingSizes.length > 0;
  const productSizes = [...new Set([...normalizeSizes(product.sizes), ...normalizeSizes(product.size)])];
  const sizes = hasSizePricing ? sizePricingSizes : [...new Set([...productSizes, ...variantSizes])];
  const hasSizes = sizes.length > 0;
  const showSizeSection = hasSizes || product.has_variants;

  const getInStock = () => {
    if (hasSizePricing && selectedSize) {
      const quantity = sizePricing[selectedSize]?.quantity;
      return quantity == null || Number(quantity) > 0;
    }
    if (selectedVariant) return selectedVariant.inventory_qty == null || selectedVariant.inventory_qty > 0;
    if (variants.length) return variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0);
    if (product.has_variants) return true;
    return product.inventory_qty == null || product.inventory_qty > 0;
  };
  const inStock = getInStock();
  const selectedSizeData = hasSizePricing ? sizePricing[selectedSize] : null;
  const selectedPiecePrice = selectedSizeData?.price_per_piece ?? selectedSizeData?.price;
  const currentPrice = selectedPiecePrice != null
    ? Math.round(Number(selectedPiecePrice) * 100)
    : selectedVariant?.price ?? product.price;
  const sizePrice = currentPrice;
  const piecesPerBoxValue = selectedSizeData?.pieces_per_box ?? selectedSizeData?.quantity ?? selectedVariant?.inventory_qty ?? product.inventory_qty;
  const piecesPerBox = Number.isFinite(Number(piecesPerBoxValue)) && Number(piecesPerBoxValue) > 0 ? Number(piecesPerBoxValue) : 1;
  const boxPrice = currentPrice * piecesPerBox;
  const totalPrice = boxPrice * qty;
  const rating = (4 + ((product.name?.length || 0) % 10) / 10).toFixed(1);
  const selectedVariantForSize = variants.find((variant: any) => variant.option1 === selectedSize);

  const selectSize = (s: string) => {
    const sizeData = hasSizePricing ? sizePricing[s] : variants.find((x: any) => x.option1 === s || x.title?.toLowerCase().includes(s.toLowerCase()));
    const sizeStock = hasSizePricing ? sizeData?.quantity : sizeData?.inventory_qty;
    if (sizeStock != null && Number(sizeStock) <= 0) return;
    setSelectedSize(s);
    setSelectionError('');
    if (hasSizePricing) {
      setSelectedVariant(null);
      return;
    }
    const v = variants.find((x: any) => x.option1 === s || x.title?.toLowerCase().includes(s.toLowerCase()));
    if (v) {
      setSelectedVariant(v);
    }
  };
  const handleAdd = () => {
    if (hasSizes && !selectedSize) {
      setSelectionError('Please select a size');
      return false;
    }
    if (!inStock) return false;
    const selectedBoxPrice = boxPrice;
    addToCart({
      product_id: product.id,
      variant_id: selectedVariantForSize?.id || selectedVariant?.id || (hasSizePricing ? selectedSize : undefined),
      name: product.name,
      selectedSize: selectedSize || undefined,
      sizePrice,
      selected_size: selectedSize || undefined,
      variant_title: selectedVariant?.title || selectedSize || undefined,
      sku: selectedVariant?.sku || product.sku || product.handle,
      price: selectedBoxPrice,
      price_per_piece: currentPrice,
      pieces_per_box: piecesPerBox,
      box_price: selectedBoxPrice,
      total_price: selectedBoxPrice * qty,
      image: product.images?.[0],
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    return true;
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
            <p className="font-poppins font-bold text-3xl text-[#0A0A0A] mt-5">{formatPrice(totalPrice)}</p>
            <p className="text-sm text-[#2C2C2C]/70 mt-1">{formatPrice(currentPrice)} / Piece</p>
            {showSizeSection && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-[#0A0A0A] mb-2">Available Sizes</p>
                {hasSizes ? (
                  <div className="flex flex-wrap gap-2.5">
                    {sizes.map(s => {
                      const v = variants.find((x: any) => x.option1 === s);
                      const sizeData = hasSizePricing ? sizePricing[s] : v;
                      const sizeStock = hasSizePricing ? sizeData?.quantity : sizeData?.inventory_qty;
                      const ok = sizeStock == null || Number(sizeStock) > 0;
                      return (
                        <button key={s} type="button" onClick={() => selectSize(s)} disabled={!ok} aria-pressed={selectedSize === s}
                          className={`min-w-[52px] px-4 py-3 rounded-xl border-2 font-medium text-sm transition ${
                            selectedSize === s ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                            : ok ? 'border-gray-200 hover:border-[#8B2635]' : 'border-gray-100 text-gray-400 line-through cursor-not-allowed'}`}>
                          {s}{!ok && <span className="block text-[10px] font-normal no-underline">Out of stock</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[#8B2635]">Size data is unavailable for this product.</p>
                )}
                {selectedSize && sizePrice != null && (
                  <p className="mt-3 text-sm text-[#2C2C2C]/70">Selected Size: {selectedSize} · {formatPrice(sizePrice)} / Piece</p>
                )}
                {!selectedSize && <p className="mt-3 text-sm text-[#8B2635] font-medium">Please select a size</p>}
              </div>
            )}
            <div className="flex items-center gap-4 mt-7">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border-2 border-gray-200 rounded-xl">
                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={!inStock || qty <= 1} className="p-3 disabled:opacity-40"><Minus size={16} /></button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} disabled={!inStock} className="p-3 disabled:opacity-40"><Plus size={16} /></button>
              </div>
              <span className="text-sm text-[#2C2C2C]/70">{qty === 1 ? 'Box' : 'Boxes'}</span>
              <button onClick={handleAdd} disabled={!inStock}
                className="flex-1 bg-[#0A0A0A] text-white py-4 rounded-xl font-medium hover:bg-[#8B2635] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {added ? (<><Check size={18} /> Added to Cart</>) : !inStock ? 'Out of Stock' : hasSizes && !selectedSize ? 'Select a Size' : 'Add to Cart'}
              </button>
            </div>
            {selectionError && <p role="alert" className="text-sm text-[#8B2635] mt-2">{selectionError}</p>}
            <p className="text-sm text-[#2C2C2C]/70 mt-2">{piecesPerBox} Pieces / Box</p>
            <p className="text-[#2C2C2C]/70 mt-4 leading-relaxed">{product.description}</p>
            <button onClick={() => { if (handleAdd()) nav('/cart'); }} disabled={!inStock}
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
