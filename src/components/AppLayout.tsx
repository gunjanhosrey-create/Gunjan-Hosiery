import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSeo } from '@/lib/seo';
import Navbar from './Navbar';
import Marquee from './Marquee';
import Hero from './Hero';
import TrustBadges from './TrustBadges';
import CategoryTiles from './CategoryTiles';
import ProductSection from './ProductSection';
import Reviews from './Reviews';
import Footer from './Footer';

const INSTA = [
  'https://d64gsuwffb70l.cloudfront.net/6a266a1da78e16ead3558256_1780902835990_690c9c15.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a266a1da78e16ead3558256_1780902868574_1df70676.png',
  'https://d64gsuwffb70l.cloudfront.net/6a266a1da78e16ead3558256_1780902929069_8ede18a4.png',
  'https://d64gsuwffb70l.cloudfront.net/6a266a1da78e16ead3558256_1780902947906_d5765bc3.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a266a1da78e16ead3558256_1780902895106_ed9f76e6.png',
  'https://d64gsuwffb70l.cloudfront.net/6a266a1da78e16ead3558256_1780902971658_e2026d37.png',
];

const productText = (product: any) => `${product.name} ${product.product_type} ${(product.tags || []).join(' ')}`.toLowerCase();

export default function AppLayout() {
  const [best, setBest] = useState<any[]>([]);
  const [arrivals, setArrivals] = useState<any[]>([]);
  const [thermal, setThermal] = useState<any[]>([]);

  useSeo({
    title: 'Gunjan Hosiery - Boys, Girls, Kids Innerwear and Thermal Wear',
    description: 'Shop boys innerwear, girls innerwear, kids innerwear and premium thermal wear from Gunjan Hosiery.',
    keywords: ['Boys Innerwear', 'Girls Innerwear', 'Kids Innerwear', 'Thermal Wear', 'Winter Collection'],
  });

  useEffect(() => {
    supabase.from('ecom_products').select('*').eq('status', 'active').then(({ data }) => {
      const all = data || [];
      setBest(all.filter(p => p.tags?.includes('bestseller')).slice(0, 4));
      setArrivals(all.filter(p => p.tags?.includes('new')).slice(0, 4));
      setThermal(all.filter(p => productText(p).includes('thermal')).slice(0, 4));
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.12 });
    setTimeout(() => document.querySelectorAll('.reveal-up').forEach(el => obs.observe(el)), 300);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Marquee />
      <Hero />
      <TrustBadges />
      <CategoryTiles />
      <ProductSection title="Best Sellers" subtitle="Customer Favourites" products={best} viewAll="/collections/best-sellers" />

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] text-white px-8 py-14 lg:px-16 lg:py-20">
          <div className="relative max-w-lg">
            <p className="text-[#D4622F] text-xs uppercase tracking-[0.2em] font-semibold">The Gunjan Promise</p>
            <h2 className="font-poppins font-bold text-3xl lg:text-5xl mt-3 leading-tight">Premium quality. Honest prices. Always.</h2>
            <p className="text-white/70 mt-4">From boys and girls essentials to winter thermal sets, we obsess over comfort so families do not have to compromise.</p>
            <a href="/about" className="inline-block mt-7 bg-white text-[#0A0A0A] px-7 py-3 rounded-full font-medium hover:bg-[#D4622F] hover:text-white transition">Our Story</a>
          </div>
        </div>
      </section>

      <ProductSection title="New Arrivals" subtitle="Fresh Drops" products={arrivals} viewAll="/collections/new-arrivals" />
      <ProductSection title="Thermal Collection" subtitle="Winter Collection" products={thermal} viewAll="/thermal" />
      <Reviews />

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8B2635] font-semibold">@gunjanhosiery</p>
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-[#0A0A0A] mt-1">Follow Our Journey</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {INSTA.map((src, i) => (
            <a key={i} href="#" className="group relative overflow-hidden rounded-2xl aspect-square">
              <img src={src} alt="Gunjan Hosiery lifestyle" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-[#8B2635]/0 group-hover:bg-[#8B2635]/30 transition" />
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
