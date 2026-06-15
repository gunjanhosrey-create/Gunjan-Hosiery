import {useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/PageShell';
import { useCart } from '@/contexts/CartContext';
import { formatPrice} from '@/lib/format';
declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const nav = useNavigate();

  const [payError, setPayError] = useState('');
  const [tax] = useState(0);
  const [loading, setLoading] = useState(false);

  const [addr, setAddr] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });

  const total = subtotal + tax;

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();

    const loaded = await loadRazorpay();

    if (!loaded) {
      alert('Razorpay SDK failed to load');
      return;
    }

    const options = {
      key: 'rzp_test_T0egHAqjvkXFKW',
      amount: total,
      currency: 'INR',
      name: 'Gunjan Hosiery',
      description: 'Order Payment',

      prefill: {
        name: addr.name,
        email: addr.email,
      },

      handler: async function (response: any) {
        try {
          const { data: customer } = await supabase
            .from('ecom_customers')
            .upsert(
              {
                email: addr.email,
                name: addr.name,
              },
              { onConflict: 'email' }
            )
            .select('id')
            .single();

          const { data: order } = await supabase
            .from('ecom_orders')
            .insert({
              customer_id: customer?.id,
              status: 'paid',
              subtotal,
              tax,
              shipping: 0,
              total,
              shipping_address: addr,
              razorpay_payment_id: response.razorpay_payment_id,
            })
            .select('id')
            .single();

          clearCart();

          nav(`/order-confirmation?id=${order?.id || ''}`);
        } catch (err) {
          console.error(err);
          setPayError('Order save failed');
        }
      },

      theme: {
        color: '#8B2635',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };
const placeCODOrder = async () => {
  try {
    setLoading(true);

    const { data: customer } = await supabase
      .from('ecom_customers')
      .upsert(
        {
          email: addr.email,
          name: addr.name,
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single();

    const { data: order } = await supabase
      .from('ecom_orders')
      .insert({
        customer_id: customer?.id,
        status: 'pending',
        payment_method: 'COD',
        payment_status: 'unpaid',
        subtotal,
        tax,
        shipping: 0,
        total,
        shipping_address: addr,
      })
      .select('id')
      .single();

    clearCart();

    nav(`/order-confirmation?id=${order?.id || ''}`);
  } catch (err) {
    console.error(err);
    setPayError('COD order failed');
  } finally {
    setLoading(false);
  }
};
  if (!cart.length) {
    return (
      <PageShell>
        <div className="py-32 text-center text-[#2C2C2C]/60">
          Your cart is empty.
        </div>
      </PageShell>
    );
  }
  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-poppins font-bold text-4xl text-[#0A0A0A] mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="font-semibold text-lg mb-4">Shipping Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Full Name" className="col-span-2 border rounded-xl p-3 text-sm" value={addr.name} onChange={e => setAddr({ ...addr, name: e.target.value })} />
              <input placeholder="Email" className="col-span-2 border rounded-xl p-3 text-sm" value={addr.email} onChange={e => setAddr({ ...addr, email: e.target.value })} />
              <input placeholder="Address" className="col-span-2 border rounded-xl p-3 text-sm" value={addr.address} onChange={e => setAddr({ ...addr, address: e.target.value })} />
              <input placeholder="City" className="border rounded-xl p-3 text-sm" value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} />
              <input placeholder="State" className="border rounded-xl p-3 text-sm" value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })} />
              <input placeholder="ZIP / PIN" className="border rounded-xl p-3 text-sm" value={addr.zip} onChange={e => setAddr({ ...addr, zip: e.target.value })} />
              <input placeholder="Country" className="border rounded-xl p-3 text-sm" value={addr.country} onChange={e => setAddr({ ...addr, country: e.target.value })} />
            </div>

            <h2 className="font-semibold text-lg mt-8 mb-4">Payment</h2>
            {payError && <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm mb-3">{payError}</div>}
            <form onSubmit={pay}>
  <button
    type="submit"
    disabled={loading}
    className="w-full mt-5 bg-[#0A0A0A] text-white py-4 rounded-xl font-medium hover:bg-[#8B2635] transition disabled:opacity-50"
  >
    {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
  </button>
  <button
  type="button"
  onClick={placeCODOrder}
  className="w-full mt-3 border border-[#8B2635] text-[#8B2635] py-4 rounded-xl font-medium hover:bg-[#8B2635] hover:text-white transition"
>
  Cash on Delivery
</button>
<h2 className="font-semibold text-lg mt-8 mb-4">Payment</h2>

{payError && (
  <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm mb-3">
    {payError}
  </div>
)}

</form>
          </div>

          <div className="bg-[#FAF8F5] rounded-2xl p-6 h-fit">
            <h2 className="font-semibold text-lg mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {cart.map(i => (
                <div key={i.product_id + (i.variant_id || '')} className="flex gap-3 items-center">
                  <img src={i.image} className="w-14 h-14 rounded-lg object-cover" alt={i.name} />
                  <div className="flex-1 text-sm">
                    <p className="font-medium line-clamp-1">{i.name}</p>
                    <p className="text-[#2C2C2C]/50 text-xs">{i.variant_title} × {i.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between"><span className="text-[#2C2C2C]/70">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-[#2C2C2C]/70">Shipping</span><span className="text-[#8B2635]">FREE</span></div>
              <div className="flex justify-between"><span className="text-[#2C2C2C]/70">Tax</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between pt-3 border-t text-base font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
