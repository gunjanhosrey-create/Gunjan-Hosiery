import { Link } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import { CheckCircle2 } from 'lucide-react';

export default function OrderConfirmation() {
  return (
    <PageShell>
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <CheckCircle2 size={72} className="mx-auto text-[#8B2635]" />
        <h1 className="font-poppins font-bold text-4xl mt-6 text-[#0A0A0A]">Order Confirmed!</h1>
        <p className="text-[#2C2C2C]/60 mt-3">Thank you for shopping with Gunjan Hosiery. A confirmation email is on its way with your order details.</p>
        <div className="flex gap-4 justify-center mt-8">
          <Link to="/shop" className="bg-[#0A0A0A] text-white px-7 py-3.5 rounded-full font-medium hover:bg-[#8B2635] transition">Continue Shopping</Link>
          <Link to="/dashboard" className="border border-[#0A0A0A] px-7 py-3.5 rounded-full font-medium hover:bg-[#0A0A0A] hover:text-white transition">My Orders</Link>
        </div>
      </div>
    </PageShell>
  );
}
