import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const load = () => supabase.from('product_reviews').select('*').eq('product_id', productId).eq('status', 'approved')
    .order('created_at', { ascending: false }).then(({ data }) => setReviews(data || []));

  useEffect(() => { load(); }, [productId]);

  useEffect(() => {
    const check = async () => {
      if (!user?.email) { setCanReview(false); return; }
      const { data: cust } = await supabase.from('ecom_customers').select('id').eq('email', user.email).maybeSingle();
      if (!cust) { setCanReview(false); return; }
      const { data: orders } = await supabase.from('ecom_orders').select('id').eq('customer_id', cust.id);
      const ids = (orders || []).map(o => o.id);
      if (!ids.length) { setCanReview(false); return; }
      const { count } = await supabase.from('ecom_order_items').select('id', { count: 'exact', head: true })
        .in('order_id', ids).eq('product_id', productId);
      setCanReview((count || 0) > 0);
    };
    check();
  }, [user, productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    await supabase.from('product_reviews').insert({
      product_id: productId, user_email: user.email,
      user_name: user.user_metadata?.name || user.email.split('@')[0],
      rating, title, body, status: 'approved', verified: true,
    });
    setSubmitted(true); setTitle(''); setBody(''); setRating(5);
    load();
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-20 border-t pt-12">
      <h2 className="font-poppins font-bold text-2xl text-[#0A0A0A] mb-2">Customer Reviews</h2>
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-8">
          <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} className={i < Math.round(avg) ? 'fill-[#D4622F] text-[#D4622F]' : 'text-gray-300'} />)}</span>
          <span className="font-semibold">{avg.toFixed(1)}</span>
          <span className="text-[#2C2C2C]/50 text-sm">({reviews.length} review{reviews.length > 1 ? 's' : ''})</span>
        </div>
      )}

      {user ? (
        canReview ? (
          submitted ? <p className="text-[#8B2635] mb-8">Thanks for your review!</p> : (
            <form onSubmit={submit} className="bg-[#FAF8F5] rounded-2xl p-6 mb-10 max-w-xl">
              <p className="font-medium text-sm mb-3">Write a review</p>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button type="button" key={i} onClick={() => setRating(i + 1)} onMouseEnter={() => setHover(i + 1)} onMouseLeave={() => setHover(0)}>
                    <Star size={26} className={i < (hover || rating) ? 'fill-[#D4622F] text-[#D4622F]' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
              <input placeholder="Review title" className="w-full border rounded-xl p-3 text-sm mb-3" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea required placeholder="Share your experience..." rows={4} className="w-full border rounded-xl p-3 text-sm mb-3" value={body} onChange={e => setBody(e.target.value)} />
              <button className="bg-[#0A0A0A] text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-[#8B2635]">Submit Review</button>
            </form>
          )
        ) : <p className="text-sm text-[#2C2C2C]/50 mb-8 bg-[#FAF8F5] rounded-xl p-4">Only verified buyers can review this product. Purchase it to share your thoughts!</p>
      ) : <p className="text-sm text-[#2C2C2C]/50 mb-8 bg-[#FAF8F5] rounded-xl p-4"><a href="/auth" className="text-[#8B2635] underline">Sign in</a> to leave a review.</p>}

      <div className="space-y-5">
        {reviews.length ? reviews.map(r => (
          <div key={r.id} className="border-b pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#8B2635] text-white flex items-center justify-center text-sm font-semibold">{(r.user_name || 'A')[0].toUpperCase()}</div>
                <div>
                  <p className="font-medium text-sm">{r.user_name} {r.verified && <span className="text-[10px] text-green-600 ml-1">✓ Verified</span>}</p>
                  <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-[#D4622F] text-[#D4622F]' : 'text-gray-300'} />)}</span>
                </div>
              </div>
              <span className="text-xs text-[#2C2C2C]/40">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            {r.title && <p className="font-medium text-sm mt-3">{r.title}</p>}
            <p className="text-sm text-[#2C2C2C]/70 mt-1">{r.body}</p>
          </div>
        )) : <p className="text-[#2C2C2C]/50 text-sm">No reviews yet. Be the first!</p>}
      </div>
    </div>
  );
}
