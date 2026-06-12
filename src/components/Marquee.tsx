const items = [
  'LOGISTICS FROM COMPANY TO YOUR DOOR',
  'PREMIUM COMBED COTTON',
  'BOYS · GIRLS · KIDS',
  'EASY 7-DAY RETURNS',
  'TRUSTED BY 50,000+ CUSTOMERS',
  'NEW ARRIVALS EVERY WEEK',
];

export default function Marquee() {
  return (
    <div className="bg-[#0A0A0A] text-white overflow-hidden py-3 border-y border-white/10">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="mx-8 text-xs md:text-sm font-medium tracking-[0.2em] flex items-center gap-8">
            {t}
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4622F]" />
          </span>
        ))}
      </div>
    </div>
  );
}
