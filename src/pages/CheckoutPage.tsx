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
  const validateForm = () => {
  setPayError('');

  if (
    !addr.name.trim() ||
    !addr.email.trim() ||
    !addr.address.trim() ||
    !addr.city.trim() ||
    !addr.state.trim() ||
    !addr.zip.trim() ||
    !addr.country.trim()
  ) {
    setPayError('Please fill all required fields');
    return false;
  }

  if (!/\S+@\S+\.\S+/.test(addr.email)) {
    setPayError('Please enter a valid email address');
    return false;
  }

  if (!/^\d{6}$/.test(addr.zip)) {
    setPayError('Please enter a valid 6 digit PIN code');
    return false;
  }

  return true;
};

  const total = subtotal + tax;

 const pay = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

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

          const { data: order, error: orderError } = await supabase
            .from('ecom_orders')
            .insert({
              status: 'paid',
              payment_method: 'ONLINE',
              shipping: 0,
              total,
              shipping_address: addr,
              razorpay_payment_id: response.razorpay_payment_id,
            })
            .select('id')
            .single();

          if (orderError) {
            console.error('ORDER ERROR:', orderError);
            throw orderError;
          }

          await supabase.from('ecom_order_items').insert(
            cart.map(item => ({
              order_id: order?.id,
              product_id: item.product_id,
              product_name: item.name,
              product_image: item.image,
              price: item.price,
              quantity: item.quantity,
              variant: item.variant_title || '',
            }))
          );

          clearCart();
          nav(`/order-confirmation?id=${order?.id || ''}`);
        } catch (err) {
          console.error('ORDER ERROR:', err);
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
  if (!validateForm()) return;
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

    const { data: order, error: orderError } = await supabase
      .from('ecom_orders')
      .insert({
        status: 'pending',
        payment_method: 'COD',
        shipping: 0,
        total,
        shipping_address: addr,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error(orderError);
      throw orderError;
    }

    await supabase.from('ecom_order_items').insert(
      cart.map(item => ({
        order_id: order?.id,
        product_id: item.product_id,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant_title || '',
      }))
    );

    clearCart();
    nav(`/order-confirmation?id=${order?.id || ''}`);
  } catch (err) {
    console.error('COD ORDER ERROR:', err);
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
              <input
  name="name"
  required
  placeholder="Full Name"
  className="col-span-2 border rounded-xl p-3 text-sm"
  value={addr.name}
  onChange={(e) => setAddr({ ...addr, name: e.target.value })}
/>

<input
  name="email"
  required
  type="email"
  placeholder="Email"
  className="col-span-2 border rounded-xl p-3 text-sm"
  value={addr.email}
  onChange={(e) => setAddr({ ...addr, email: e.target.value })}
/>

<input
  name="address"
  required
  placeholder="Address"
  className="col-span-2 border rounded-xl p-3 text-sm"
  value={addr.address}
  onChange={(e) => setAddr({ ...addr, address: e.target.value })}
/>

<input
  name="city"
  required
  placeholder="City"
  className="border rounded-xl p-3 text-sm"
  value={addr.city}
  onChange={(e) => setAddr({ ...addr, city: e.target.value })}
/>

<input
  name="state"
  required
  placeholder="State"
  className="border rounded-xl p-3 text-sm"
  value={addr.state}
  onChange={(e) => setAddr({ ...addr, state: e.target.value })}
/>

<input
  name="zip"
  required
  placeholder="ZIP / PIN"
  className="border rounded-xl p-3 text-sm"
  value={addr.zip}
  onChange={(e) => setAddr({ ...addr, zip: e.target.value })}
/>

<input
  name="country"
  required
  placeholder="Country"
  className="border rounded-xl p-3 text-sm"
  value={addr.country}
  onChange={(e) => setAddr({ ...addr, country: e.target.value })}
/>
            </div>
            
            <h2 className="font-semibold text-lg mt-8 mb-4">
              Payment
            </h2>

            {payError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm mb-3">
                {payError}
              </div>
            )}

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
