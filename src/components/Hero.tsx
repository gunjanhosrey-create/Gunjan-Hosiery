import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  const heroImages = [
    '/main/main1.png',
    '/main/main2.png',
    '/main/main3.png',
    '/main/main4.png',
    '/main/main5.png',
  ];

  const [currentImage, setCurrentImage] = useState(0);

  // Auto Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Mouse Parallax Effect
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.6) * 16;
      const y = (e.clientY / window.innerHeight - 0.6) * 16;
      el.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className="relative h-[87vh] min-h-[560px] overflow-hidden bg-[#F5F1ED]">
      
      {/* Background Slider */}
      <div
        ref={ref}
        className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform"
      >
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Hero ${index + 1}`}
            className={`absolute inset-0 w-full h-fix object-cover transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative h-fix max-w-7xl mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-xl text-white reveal-up">
          
          <span className="inline-block bg-[#D4622F] text-white text-xs font-semibold tracking-[0.2em] px-4 py-1.5 rounded-full mb-5">
            NEW SEASON - 2026
          </span>

          <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            Everyday Essentials,
            <br />
            <span className="text-[#D4622F]">Elevated.</span>
          </h1>

          <p className="text-white/80 text-base lg:text-lg mt-5 max-w-md leading-relaxed">
            Premium hosiery for boys, girls, kids and thermal wear.
            Soft comfort, clean fits, honest prices.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 bg-white text-[#0A0A0A] px-7 py-3.5 rounded-full font-medium hover:bg-[#D4622F] hover:text-white transition"
            >
              Shop Collection
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition"
              />
            </Link>

            <Link
              to="/thermal"
              className="inline-flex items-center gap-2 border border-white/50 text-white px-7 py-3.5 rounded-full font-medium hover:bg-white/10 transition"
            >
              Thermal Collection
            </Link>
          </div>

          <div className="flex gap-8 mt-10">
            <div>
              <p className="font-poppins font-bold text-2xl">50K+</p>
              <p className="text-white/60 text-xs mt-0.5">
                Happy Customers
              </p>
            </div>

            <div>
              <p className="font-poppins font-bold text-2xl">4.8</p>
              <p className="text-white/60 text-xs mt-0.5">
                Avg. Rating
              </p>
            </div>

            <div>
              <p className="font-poppins font-bold text-2xl">100%</p>
              <p className="text-white/60 text-xs mt-0.5">
                Combed Cotton
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Cards */}
      <div className="hidden lg:flex absolute right-12 top-1/3 flex-col gap-4">
        {['Boys Innerwear', 'Girls Essentials', 'Thermal Sets'].map(
          (t, i) => (
            <div
              key={t}
              className="bg-white/90 backdrop-blur rounded-2xl px-5 py-3 shadow-xl"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <p className="text-xs text-[#8B2635] font-semibold">
                TRENDING
              </p>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {t}
              </p>
            </div>
          )
        )}
      </div>

      {/* Slider Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImage
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}