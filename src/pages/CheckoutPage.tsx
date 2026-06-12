import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import PageShell from '@/components/PageShell';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, PROJECT_ID } from '@/lib/format';

const STRIPE_ACCOUNT_ID = 'acct_1TfxLAHGfPcVH4jF';
const PK = 'pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ';

declare global { interface Window { Stripe?: any; } }

function loadStripeJs(): Promise<any> {
  return new Promise((resolve) => {
    if (window.Stripe) return resolve(window.Stripe(PK, { stripeAccount: STRIPE_ACCOUNT_ID }));
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload = () => resolve(window.Stripe(PK, { stripeAccount: STRIPE_ACCOUNT_ID }));
    document.head.appendChild(s);
  });
}

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const nav = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [payError, setPayError] = useState('');
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addr, setAddr] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '', country: 'India' });
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const total = subtotal + tax;

  useEffect(() => {
    if (!cart.length) return;
    setClientSecret(''); setPayError('');
    supabase.functions.invoke('create-payment-intent', { body: { amount: total, currency: 'inr' } })
      .then(({ data, error }) => {
        if (error || !data?.clientSecret) { setPayError('Unable to initialize payment. Please try again.'); return; }
        setClientSecret(data.clientSecret);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  useEffect(() => {
    if (addr.state) {
      supabase.functions.invoke('calculate-tax', { body: { state: addr.state, subtotal } })
        .then(({ data }) => { if (data?.success) setTax(data.taxCents); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr.state]);

  useEffect(() => {
    if (!clientSecret || !mountRef.current) return;
    let cancelled = false;
    loadStripeJs().then((stripe) => {
      if (cancelled) return;
      stripeRef.current = stripe;
      const elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
      elementsRef.current = elements;
      const pe = elements.create('payment');
      pe.mount(mountRef.current);
    });
    return () => { cancelled = true; };
  }, [clientSecret]);

  const onSuccess = async (pi: any) => {
    const { data: customer } = await supabase.from('ecom_customers')
      .upsert({ email: addr.email, name: addr.name }, { onConflict: 'email' }).select('id').single();
    const { data: order } = await supabase.from('ecom_orders').insert({
      customer_id: customer?.id, status: 'paid', subtotal, tax, shipping: 0, total,
      shipping_address: addr, stripe_payment_intent_id: pi.id,
    }).select('id').single();
    if (order) {
      const items = cart.map(i => ({
        order_id: order.id, product_id: i.product_id, variant_id: i.variant_id || null,
        product_name: i.name, variant_title: i.variant_title || null, sku: i.sku || null,
        quantity: i.quantity, unit_price: i.price, total: i.price * i.quantity,
      }));
      await supabase.from('ecom_order_items').insert(items);
      try {
        await fetch(`https://famous.ai/api/ecommerce/${PROJECT_ID}/send-confirmation`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, customerEmail: addr.email, customerName: addr.name, orderItems: items, subtotal, shipping: 0, tax, total, shippingAddress: addr }),
        });
      } catch {}
    }
    clearCart();
    nav(`/order-confirmation?id=${order?.id || ''}`);
  };

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeRef.current || !elementsRef.current) return;
    setLoading(true); setPayError('');
    const { error, paymentIntent } = await stripeRef.current.confirmPayment({ elements: elementsRef.current, redirect: 'if_required' });
    if (error) { setPayError(error.message || 'Payment failed'); setLoading(false); }
    else if (paymentIntent?.status === 'succeeded') onSuccess(paymentIntent);
    else setLoading(false);
  };

  if (!cart.length) {
    return <PageShell><div className="py-32 text-center text-[#2C2C2C]/60">Your cart is empty. <a href="/shop" className="text-[#8B2635] underline">Shop now</a></div></PageShell>;
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
            {clientSecret ? (
              <form onSubmit={pay}>
                <div ref={mountRef} />
                <button type="submit" disabled={loading} className="w-full mt-5 bg-[#0A0A0A] text-white py-4 rounded-xl font-medium hover:bg-[#8B2635] transition disabled:opacity-50">
                  {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                </button>
              </form>
            ) : !payError ? (
              <div className="text-[#2C2C2C]/60 text-sm py-6">Loading payment form...</div>
            ) : null}
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
