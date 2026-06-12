import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStorageImages } from '@/lib/storageImages';

const HERO = 'https://d64gsuwffb70l.cloudfront.net/6a266a1da78e16ead3558256_1780902780540_89a3a52a.jpg';

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const banners = useStorageImages('banners', [HERO]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      el.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className="relative h-[88vh] min-h-[560px] overflow-hidden bg-[#F5F1ED]">
      <div ref={ref} className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform">
        <img src={banners[0]} alt="Gunjan Hosiery winter and everyday essentials" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-xl text-white reveal-up">
          <span className="inline-block bg-[#D4622F] text-white text-xs font-semibold tracking-[0.2em] px-4 py-1.5 rounded-full mb-5">
            NEW SEASON - 2026
          </span>
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            Everyday Essentials,<br /><span className="text-[#D4622F]">Elevated.</span>
          </h1>
          <p className="text-white/80 text-base lg:text-lg mt-5 max-w-md leading-relaxed">
            Premium hosiery for boys, girls, kids and thermal wear. Soft comfort, clean fits, honest prices.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/shop" className="group inline-flex items-center gap-2 bg-white text-[#0A0A0A] px-7 py-3.5 rounded-full font-medium hover:bg-[#D4622F] hover:text-white transition">
              Shop Collection <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link to="/thermal" className="inline-flex items-center gap-2 border border-white/50 text-white px-7 py-3.5 rounded-full font-medium hover:bg-white/10 transition">
              Thermal Collection
            </Link>
          </div>
          <div className="flex gap-8 mt-10">
            {[['50K+', 'Happy Customers'], ['4.8', 'Avg. Rating'], ['100%', 'Combed Cotton']].map(([a, b]) => (
              <div key={b}>
                <p className="font-poppins font-bold text-2xl">{a}</p>
                <p className="text-white/60 text-xs mt-0.5">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute right-12 top-1/3 flex-col gap-4">
        {['Boys Innerwear', 'Girls Essentials', 'Thermal Sets'].map((t, i) => (
          <div key={t} className="bg-white/90 backdrop-blur rounded-2xl px-5 py-3 shadow-xl float-chip" style={{ animationDelay: `${i * 0.4}s` }}>
            <p className="text-xs text-[#8B2635] font-semibold">TRENDING</p>
            <p className="text-sm font-medium text-[#0A0A0A]">{t}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
