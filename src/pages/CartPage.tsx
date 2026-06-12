import { Link, useNavigate } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/format';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, subtotal } = useCart();
  const nav = useNavigate();

  if (!cart.length) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <ShoppingBag size={56} className="mx-auto text-[#2C2C2C]/20" />
          <h1 className="font-poppins font-bold text-3xl mt-6">Your cart is empty</h1>
          <p className="text-[#2C2C2C]/60 mt-2">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="inline-block mt-7 bg-[#0A0A0A] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#8B2635] transition">Start Shopping</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-poppins font-bold text-4xl text-[#0A0A0A] mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.product_id + (item.variant_id || '')} className="flex gap-4 bg-[#FAF8F5] rounded-2xl p-4">
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium text-[#0A0A0A]">{item.name}</h3>
                  {item.variant_title && <p className="text-sm text-[#2C2C2C]/60">Size: {item.variant_title}</p>}
                  <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 bg-white rounded-lg">
                      <button onClick={() => updateQty(item.product_id, item.variant_id, item.quantity - 1)} className="p-2"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, item.variant_id, item.quantity + 1)} className="p-2"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id, item.variant_id)} className="text-[#8B2635] p-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 h-fit">
            <h2 className="font-poppins font-bold text-xl mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#2C2C2C]/70">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-[#2C2C2C]/70">Shipping</span><span className="font-medium text-[#8B2635]">FREE</span></div>
              <div className="flex justify-between pt-3 border-t text-base font-semibold"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            </div>
            <button onClick={() => nav('/checkout')} className="w-full mt-6 bg-[#0A0A0A] text-white py-4 rounded-xl font-medium hover:bg-[#8B2635] transition flex items-center justify-center gap-2">
              Checkout <ArrowRight size={18} />
            </button>
            <Link to="/shop" className="block text-center mt-3 text-sm text-[#2C2C2C]/60 hover:text-[#8B2635]">Continue shopping</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
