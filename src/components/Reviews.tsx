import { Star, Quote } from 'lucide-react';
const reviews = [
  { name: 'Aarav S.', text: 'Best socks I have ever bought. The cotton is incredibly soft and they hold up wash after wash.', loc: 'Mumbai' },
  { name: 'Priya M.', text: 'Ordered tees for the whole family. Premium feel at honest prices. Delivery was super quick!', loc: 'Delhi' },
  { name: 'Rahul K.', text: 'The vests are a daily essential now. Breathable and comfortable all day long.', loc: 'Bangalore' },
];

export default function Reviews() {
  return (
    <section className="bg-[#FAF8F5] py-16 mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8B2635] font-semibold">Loved by thousands</p>
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-[#0A0A0A] mt-1">OUR HAPPY CUSTOMERS</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map(r => (
            <div key={r.name} className="bg-white rounded-3xl p-7 shadow-sm hover:shadow-lg transition reveal-up">
              <Quote size={28} className="text-[#D4622F]/30" />
              <div className="flex gap-0.5 my-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className="fill-[#D4622F] text-[#D4622F]" />)}
              </div>
              <p className="text-[#2C2C2C] leading-relaxed text-sm">"{r.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8B2635] text-white flex items-center justify-center font-semibold text-sm">{r.name[0]}</div>
                <div>
                  <p className="font-semibold text-sm text-[#0A0A0A]">{r.name}</p>
                  <p className="text-xs text-[#2C2C2C]/60">{r.loc} · Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
