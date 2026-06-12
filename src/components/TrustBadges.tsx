import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const badges = [
  { icon: Truck, title: 'Free Shipping', desc: 'On all orders, always' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: '100% protected checkout' },
  { icon: Headphones, title: '24/7 Support', desc: "We're here to help" },
];

export default function TrustBadges() {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map(b => (
          <div key={b.title} className="flex items-center gap-4 bg-[#FAF8F5] rounded-2xl p-5 hover:shadow-md transition reveal-up">
            <div className="w-12 h-12 rounded-full bg-[#8B2635]/10 flex items-center justify-center shrink-0">
              <b.icon size={22} className="text-[#8B2635]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#0A0A0A]">{b.title}</p>
              <p className="text-xs text-[#2C2C2C]/60 mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
